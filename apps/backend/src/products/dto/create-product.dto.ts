import { IsString, IsOptional, IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @ApiProperty({ example: 'PROD-001', description: 'SKU del producto (único)' })
    @IsNotEmpty({ message: 'El SKU es requerido' })
    @IsString()
    sku: string;

    @ApiProperty({ example: 'Tornillo Phillips #8', description: 'Nombre del producto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Tornillo metálico para madera', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'Ferretería', required: false })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({ example: 15.50, description: 'Precio de venta' })
    @IsNotEmpty({ message: 'El precio de venta es requerido' })
    @Type(() => Number)
    @IsNumber({}, { message: 'El precio de venta debe ser un número' })
    @Min(0, { message: 'El precio de venta no puede ser negativo' })
    salePrice: number;

    @ApiProperty({ example: 10.00, description: 'Precio de costo' })
    @IsNotEmpty({ message: 'El precio de costo es requerido' })
    @Type(() => Number)
    @IsNumber({}, { message: 'El precio de costo debe ser un número' })
    @Min(0, { message: 'El precio de costo no puede ser negativo' })
    costPrice: number;

    @ApiProperty({ example: 100, description: 'Cantidad en stock', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El stock debe ser un número entero' })
    @Min(0, { message: 'El stock no puede ser negativo' })
    stock?: number;

    @ApiProperty({ example: 'UND', description: 'Unidad de medida (UND, KG, LTS, etc.)', required: false })
    @IsOptional()
    @IsString()
    unit?: string;
}
