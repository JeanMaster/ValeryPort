import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
    constructor(private prisma: PrismaService) { }

    async create(createPurchaseDto: CreatePurchaseDto) {
        const { supplierId, items, ...purchaseData } = createPurchaseDto;

        // Verify supplier exists
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: supplierId },
        });
        if (!supplier) {
            throw new NotFoundException(`Proveedor con ID ${supplierId} no encontrado`);
        }

        // Calculate totals
        let subtotal = 0;
        const itemsWithTotal: any[] = []; // Explicitly typed as any[] to avoid never[] inference, or better define interface

        // Verify currency and get conversion rate
        const currencyCode = purchaseData.currencyCode || 'VES';
        const exchangeRate = purchaseData.exchangeRate || 1;

        // Find currency entity to get its ID for product update
        const currency = await this.prisma.currency.findUnique({
            where: { code: currencyCode }
        });

        if (!currency) {
            throw new NotFoundException(`Moneda ${currencyCode} no encontrada`);
        }

        // Validations and calculations
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
            }

            const itemTotal = item.quantity * item.cost;
            subtotal += itemTotal;

            itemsWithTotal.push({
                ...item,
                total: itemTotal,
                oldCost: product.costPrice,
            });
        }

        // Calculate tax (Assuming 16% or 0 based on product? Purchase usually comes with tax info from invoice)
        // For now simplifed: The DTO didn't request total/tax, so we calculate or expect it?
        // In schema schema `taxAmount` is required.
        // Let's assume standard tax or 0 for now until tax logic is more complex.
        // Ideally user inputs tax from invoice. But DTO didn't have it.
        // Let's calculate based on products tax status? Too complex for now.
        // Let's assume input totals or calculate 0 tax for now and fix later if needed or add to DTO.
        // Actually schema requires `taxAmount`, `subtotal`, `total`.
        // I should calculate them or accept them.
        // Let's calculate simple 0 tax for MVP or 16%?
        // Let's add `total` and `tax` to DTO or calculate.
        // I'll calculate subtotal from items.
        // I'll assume 0 tax for now to avoid specific tax logic issues unless products have tax.
        const taxRate = 0; // TODO: Get from settings or per product
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Purchase
            const purchase = await tx.purchase.create({
                data: {
                    ...purchaseData,
                    supplierId,
                    subtotal,
                    taxAmount,
                    total,
                    items: {
                        create: itemsWithTotal.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            cost: item.cost,
                            total: item.total,
                            oldCost: item.oldCost,
                        })),
                    },
                },
                include: {
                    items: true,
                    supplier: true,
                },
            });

            // 2. Update Stock and Cost for each product
            for (const item of itemsWithTotal) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { increment: item.quantity },
                        costPrice: item.cost, // Update to new cost in SELECTED currency
                        currencyId: currency.id, // Update product currency to purchase currency
                    },
                });
            }

            return purchase;
        });
    }

    async findAll() {
        return this.prisma.purchase.findMany({
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!purchase) {
            throw new NotFoundException(`Compra con ID ${id} no encontrada`);
        }

        return purchase;
    }
}
