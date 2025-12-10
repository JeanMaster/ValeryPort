import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class SalesService {
    constructor(
        private prisma: PrismaService,
        private invoiceService: InvoiceService
    ) { }

    /**
     * Crear una nueva venta
     */
    async create(createSaleDto: CreateSaleDto) {
        const { items, invoiceNumber: reservedInvoiceNumber, ...saleData } = createSaleDto;

        // Validar que los productos existen y tienen stock suficiente
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                throw new BadRequestException(`Producto con ID ${item.productId} no encontrado`);
            }

            // Solo validar stock si el producto tiene control de inventario (stock > 0)
            // Si stock = 0 o stock < 0, significa que no hay control de inventario
            // Si stock > 0, entonces sí hay control de inventario
            if (product.stock > 0 && product.stock < item.quantity) {
                throw new BadRequestException(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
            }
        }

        // Crear la venta con items en una transacción
        return await this.prisma.$transaction(async (prisma) => {
            // Use reserved invoice number if provided, otherwise generate a new one
            let invoiceNumber = reservedInvoiceNumber;
            if (!invoiceNumber) {
                // Generar número de factura DENTRO de la transacción para evitar race conditions
                invoiceNumber = await this.invoiceService.generateInvoiceNumber();
            }

            // Crear la venta con número de factura
            const sale = await prisma.sale.create({
                data: {
                    ...saleData,
                    invoiceNumber, // Asignar número de factura
                    items: {
                        create: items,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    client: true,
                },
            });

            // Actualizar stock de productos solo si tienen stock controlado (stock > 0)
            for (const item of items) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                });

                if (product && product.stock > 0) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }
            }

            return sale;
        });
    }

    /**
     * Listar todas las ventas
     */
    async findAll() {
        return this.prisma.sale.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                client: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Listar ventas con filtros
     */
    async findWithFilters(filters: any) {
        const where: any = {};

        // Filtro por rango de fechas
        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate) {
                where.date.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                // Agregar un día para incluir toda la fecha final
                const endDate = new Date(filters.endDate);
                endDate.setDate(endDate.getDate() + 1);
                where.date.lt = endDate;
            }
        }

        // Filtro por cliente
        if (filters.clientId) {
            where.clientId = filters.clientId;
        }

        // Filtro por forma de pago
        if (filters.paymentMethod) {
            where.paymentMethod = filters.paymentMethod;
        }

        // Filtro por monto mínimo y máximo
        if (filters.minAmount || filters.maxAmount) {
            where.total = {};
            if (filters.minAmount) {
                where.total.gte = filters.minAmount;
            }
            if (filters.maxAmount) {
                where.total.lte = filters.maxAmount;
            }
        }

        // Filtro por producto específico (buscar en los items)
        if (filters.productId) {
            where.items = {
                some: {
                    productId: filters.productId,
                },
            };
        }

        return this.prisma.sale.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                client: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Obtener una venta por ID
     */
    async findOne(id: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                client: true,
            },
        });

        if (!sale) {
            throw new BadRequestException(`Venta con ID ${id} no encontrada`);
        }

        return sale;
    }
}