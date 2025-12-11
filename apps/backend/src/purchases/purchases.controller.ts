import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar una nueva compra' })
    @ApiResponse({ status: 201, description: 'Compra registrada y stock actualizado exitosamente' })
    create(@Body() createPurchaseDto: CreatePurchaseDto) {
        return this.purchasesService.create(createPurchaseDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar historial de compras' })
    findAll() {
        return this.purchasesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de una compra' })
    findOne(@Param('id') id: string) {
        return this.purchasesService.findOne(id);
    }
}
