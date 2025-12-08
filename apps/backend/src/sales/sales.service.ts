import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Crear una nueva venta
     */
    async create(createSaleDto: CreateSaleDto) {
        const { items, ...saleData } = createSaleDto;

        // Validar que los productos existen y tienen stock suficiente
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                throw new BadRequestException(`Producto con ID ${item.productId} no encontrado`);
            }

            if (product.stock < item.quantity) {
                throw new BadRequestException(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
            }
        }

        // Crear la venta con items en una transacción
        return await this.prisma.$transaction(async (prisma) => {
            // Crear la venta
            const sale = await prisma.sale.create({
                data: {
                    ...saleData,
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

            // Actualizar stock de productos
            for (const item of items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
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