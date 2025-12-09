import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
    imports: [InvoiceModule],
    providers: [SalesService],
    controllers: [SalesController]
})
export class SalesModule { }