import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { InvoiceModule } from '../invoice/invoice.module';
import { CashRegisterModule } from '../cash-register/cash-register.module';

@Module({
    imports: [InvoiceModule, CashRegisterModule],
    providers: [SalesService],
    controllers: [SalesController]
})
export class SalesModule { }