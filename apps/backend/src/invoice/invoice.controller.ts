import { Controller, Get } from '@nestjs/common';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    /**
     * Get the next invoice number (for display purposes, doesn't increment)
     */
    @Get('next')
    async getNextInvoiceNumber() {
        const nextNumber = await this.invoiceService.getNextInvoiceNumber();
        return { invoiceNumber: nextNumber };
    }

    /**
     * Get current counter status
     */
    @Get('counter')
    async getCurrentCounter() {
        return this.invoiceService.getCurrentCounter();
    }
}
