import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import dayjs from 'dayjs';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const today = dayjs().startOf('day').toDate();
        const monthStart = dayjs().startOf('month').toDate();
        const lastMonthStart = dayjs().subtract(1, 'month').startOf('month').toDate();
        const lastMonthEnd = dayjs().subtract(1, 'month').endOf('month').toDate();

        // Today's sales
        const todaySales = await this.prisma.sale.aggregate({
            where: { createdAt: { gte: today } },
            _sum: { total: true },
        });

        // This month's sales
        const thisMonthSales = await this.prisma.sale.aggregate({
            where: { createdAt: { gte: monthStart } },
            _sum: { total: true },
        });

        // Last month's sales
        const lastMonthSales = await this.prisma.sale.aggregate({
            where: {
                createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
            },
            _sum: { total: true },
        });

        // Top 5 selling products
        const topProducts = await this.prisma.saleItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });

        const topProductsData = await Promise.all(
            topProducts.map(async (item) => {
                const product = await this.prisma.product.findUnique({
                    where: { id: item.productId },
                });
                return {
                    name: product?.name,
                    quantity: item._sum.quantity,
                };
            }),
        );

        // Products with critical stock (below 10 units as example)
        const criticalStock = await this.prisma.product.count({
            where: { stock: { lt: 10 } },
        });

        // Total products
        const totalProducts = await this.prisma.product.count();

        // Active cash session balance
        const activeSession = await this.prisma.cashSession.findFirst({
            where: { status: 'OPEN' },
        });

        // Last 7 days sales trend
        const last7Days: { date: string; sales: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = dayjs().subtract(i, 'day').startOf('day').toDate();
            const nextDate = dayjs().subtract(i, 'day').endOf('day').toDate();

            const daySales = await this.prisma.sale.aggregate({
                where: {
                    createdAt: { gte: date, lte: nextDate },
                },
                _sum: { total: true },
            });

            last7Days.push({
                date: dayjs(date).format('DD/MM'),
                sales: Number(daySales._sum.total || 0),
            });
        }

        return {
            todaySales: Number(todaySales._sum.total || 0),
            thisMonthSales: Number(thisMonthSales._sum.total || 0),
            lastMonthSales: Number(lastMonthSales._sum.total || 0),
            topProducts: topProductsData,
            criticalStock,
            totalProducts,
            cashBalance: activeSession ? Number(activeSession.openingBalance) : 0,
            salesTrend: last7Days,
        };
    }

    async getInventoryReport() {
        // Stock by department - get all products and group by category
        const products = await this.prisma.product.findMany({
            where: { active: true },
            select: {
                stock: true,
                costPrice: true,
                categoryId: true,
                category: { select: { name: true } },
            },
        });

        // Group by department/category
        const deptMap = new Map<string, { units: number; value: number }>();
        products.forEach((p) => {
            const deptName = p.category?.name || 'Sin Categoría';
            const existing = deptMap.get(deptName) || { units: 0, value: 0 };
            existing.units += p.stock;
            existing.value += p.stock * Number(p.costPrice);
            deptMap.set(deptName, existing);
        });

        const stockByDept = Array.from(deptMap.entries()).map(
            ([department, data]) => ({
                department,
                units: data.units,
                value: data.value,
            }),
        );

        // Products below minimum stock (assuming 10 as threshold)
        const lowStock = await this.prisma.product.findMany({
            where: { stock: { lt: 10 } },
            select: {
                name: true,
                stock: true,
                category: { select: { name: true } },
            },
            take: 20,
        });

        // Total inventory value
        const allProducts = await this.prisma.product.findMany({
            select: { stock: true, costPrice: true },
        });
        const totalValue = allProducts.reduce(
            (sum, p) => sum + p.stock * Number(p.costPrice),
            0,
        );

        return {
            stockByDepartment: stockByDept,
            lowStockProducts: lowStock,
            totalInventoryValue: totalValue,
        };
    }

    async getFinanceReport() {
        const monthStart = dayjs().startOf('month').toDate();

        // Monthly sales
        const monthlySales = await this.prisma.sale.findMany({
            where: { createdAt: { gte: monthStart } },
            select: {
                total: true,
                paymentMethod: true,
                createdAt: true,
            },
        });

        // Payment methods breakdown - properly parse multi-payment sales
        // Format can be: "CASH" or "CASH:600, DEBIT:300, TRANSFER:300"
        const paymentBreakdown: Record<string, number> = {};

        monthlySales.forEach((sale) => {
            const paymentStr = sale.paymentMethod || 'CASH';

            // Split by comma to handle multi-payment sales
            const paymentMethods = paymentStr.split(', ');

            paymentMethods.forEach((payment) => {
                // Extract method and amount if format is "METHOD:amount"
                const parts = payment.trim().split(':');
                const method = parts[0].trim();
                const amount = parts.length > 1 ? parseFloat(parts[1]) : Number(sale.total);

                paymentBreakdown[method] = (paymentBreakdown[method] || 0) + amount;
            });
        });

        // Monthly purchases
        const monthlyPurchases = await this.prisma.purchase.aggregate({
            where: { createdAt: { gte: monthStart } },
            _sum: { total: true },
        });

        // Daily sales this month
        const dailySales = monthlySales.reduce(
            (acc, sale) => {
                const date = dayjs(sale.createdAt).format('YYYY-MM-DD');
                acc[date] = (acc[date] || 0) + Number(sale.total);
                return acc;
            },
            {} as Record<string, number>,
        );

        return {
            monthlySalesTotal: monthlySales.reduce(
                (sum, s) => sum + Number(s.total),
                0,
            ),
            monthlyPurchasesTotal: Number(monthlyPurchases._sum.total || 0),
            paymentMethodsBreakdown: Object.entries(paymentBreakdown).map(
                ([method, amount]) => ({
                    method,
                    amount,
                }),
            ),
            dailySalesData: Object.entries(dailySales).map(
                ([date, amount]) => ({
                    date: dayjs(date).format('DD/MM'),
                    amount,
                }),
            ),
        };
    }
}
