import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate the next invoice number
     */
    async generateInvoiceNumber(): Promise<string> {
        // Use transaction to prevent race conditions with concurrent requests
        return await this.prisma.$transaction(async (prisma) => {
            // Find or create the invoice counter
            let counter = await prisma.invoiceCounter.findFirst();

            if (!counter) {
                // Create initial counter
                counter = await prisma.invoiceCounter.create({
                    data: {
                        prefix: 'FAC',
                        currentNumber: 1
                    }
                });
            }

            // Generate invoice number with leading zeros (8 digits)
            const invoiceNumber = `${counter.prefix}-${counter.currentNumber.toString().padStart(8, '0')}`;

            // Increment counter for next invoice (atomic operation within transaction)
            await prisma.invoiceCounter.update({
                where: { id: counter.id },
                data: {
                    currentNumber: counter.currentNumber + 1
                }
            });

            return invoiceNumber;
        });
    }

    /**
     * Get current invoice counter
     */
    async getCurrentCounter() {
        return this.prisma.invoiceCounter.findFirst();
    }

    /**
     * Get the next invoice number without incrementing (for display purposes)
     */
    async getNextInvoiceNumber(): Promise<string> {
        return await this.prisma.$transaction(async (prisma) => {
            // Find or create the invoice counter
            let counter = await prisma.invoiceCounter.findFirst();

            if (!counter) {
                // Create initial counter
                counter = await prisma.invoiceCounter.create({
                    data: {
                        prefix: 'FAC',
                        currentNumber: 1
                    }
                });
            }

            // Return the next invoice number without incrementing
            return `${counter.prefix}-${counter.currentNumber.toString().padStart(8, '0')}`;
        });
    }

    /**
     * Reset invoice counter (for testing or new fiscal year)
     */
    async resetCounter() {
        return this.prisma.invoiceCounter.updateMany({
            data: {
                currentNumber: 1
            }
        });
    }
}