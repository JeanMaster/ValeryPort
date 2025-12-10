import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { InvoiceService } from '../invoice/invoice.service';
import { CreateSaleDto } from './dto/create-sale.dto';

export interface SalesFilters {
    startDate?: string;
    endDate?: string;
    clientId?: string;
    productId?: string;
    paymentMethod?: string;
    minAmount?: number;
    maxAmount?: number;
}

@ApiTags('sales')
@Controller('sales')
export class SalesController {
    constructor(
        private readonly salesService: SalesService,
        private readonly invoiceService: InvoiceService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva venta' })
    @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos o stock insuficiente' })
    create(@Body() createSaleDto: CreateSaleDto) {
        return this.salesService.create(createSaleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar ventas con filtros' })
    @ApiResponse({ status: 200, description: 'Lista de ventas filtradas' })
    findWithFilters(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('clientId') clientId?: string,
        @Query('productId') productId?: string,
        @Query('paymentMethod') paymentMethod?: string,
        @Query('minAmount') minAmount?: string,
        @Query('maxAmount') maxAmount?: string
    ) {
        const filters: SalesFilters = {};

        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (clientId) filters.clientId = clientId;
        if (productId) filters.productId = productId;
        if (paymentMethod) filters.paymentMethod = paymentMethod;
        if (minAmount) filters.minAmount = parseFloat(minAmount);
        if (maxAmount) filters.maxAmount = parseFloat(maxAmount);

        return this.salesService.findWithFilters(filters);
    }

    @Get('all')
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

    @Get('next-invoice-number')
    @ApiOperation({ summary: 'Obtener el próximo número de factura' })
    @ApiResponse({ status: 200, description: 'Próximo número de factura' })
    getNextInvoiceNumber() {
        return this.invoiceService.getNextInvoiceNumber();
    }

    @Get('reserve-invoice-number')
    @ApiOperation({ summary: 'Reservar un número de factura para uso inmediato' })
    @ApiResponse({ status: 200, description: 'Número de factura reservado' })
    reserveInvoiceNumber() {
        return this.invoiceService.reserveInvoiceNumber();
    }
}