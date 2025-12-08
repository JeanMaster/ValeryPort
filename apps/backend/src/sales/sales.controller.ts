import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva venta' })
    @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos o stock insuficiente' })
    create(@Body() createSaleDto: CreateSaleDto) {
        return this.salesService.create(createSaleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las ventas' })
    @ApiResponse({ status: 200, description: 'Lista de ventas' })
    findAll() {
        return this.salesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una venta por ID' })
    @ApiResponse({ status: 200, description: 'Venta encontrada' })
    @ApiResponse({ status: 404, description: 'Venta no encontrada' })
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }
}