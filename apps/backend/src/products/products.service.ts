import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Crear un nuevo producto
     */
    async create(createProductDto: CreateProductDto) {
        try {
            const product = await this.prisma.product.create({
                data: createProductDto,
            });
            return {
                ...product,
                salePrice: Number(product.salePrice),
                costPrice: Number(product.costPrice),
            };
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('El SKU ya está registrado');
            }
            throw error;
        }
    }

    /**
     * Listar todos los productos activos con filtros opcionales
     */
    async findAll(search?: string, active: boolean = true) {
        const where: any = { active };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }

        const products = await this.prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Convert Decimal to number for JSON serialization
        return products.map(product => ({
            ...product,
            salePrice: Number(product.salePrice),
            costPrice: Number(product.costPrice),
        }));
    }

    /**
     * Obtener un producto por ID
     */
    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }

        return {
            ...product,
            salePrice: Number(product.salePrice),
            costPrice: Number(product.costPrice),
        };
    }

    /**
     * Actualizar un producto
     */
    async update(id: string, updateProductDto: UpdateProductDto) {
        await this.findOne(id);

        try {
            const product = await this.prisma.product.update({
                where: { id },
                data: updateProductDto,
            });
            return {
                ...product,
                salePrice: Number(product.salePrice),
                costPrice: Number(product.costPrice),
            };
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('El SKU ya está registrado por otro producto');
            }
            throw error;
        }
    }

    /**
     * Soft delete: marcar como inactivo
     */
    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.product.update({
            where: { id },
            data: { active: false },
        });
    }
}
