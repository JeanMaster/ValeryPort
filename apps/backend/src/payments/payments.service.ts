import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async createPayment(createPaymentDto: CreatePaymentDto) {
        // Verificar que la factura existe
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: createPaymentDto.invoiceId },
        });

        if (!invoice) {
            throw new NotFoundException('Factura no encontrada');
        }

        // Verificar que la factura no esté completamente pagada
        if (invoice.status === 'PAID') {
            throw new BadRequestException('La factura ya está completamente pagada');
        }

        // Verificar que el monto de pago no exceda el balance pendiente
        const balance = Number(invoice.balance);
        if (createPaymentDto.amount > balance) {
            throw new BadRequestException(
                `El monto del pago (${createPaymentDto.amount}) excede el balance pendiente (${balance})`
            );
        }

        // Crear el pago y actualizar la factura en una transacción
        const result = await this.prisma.$transaction(async (tx) => {
            // Crear el pago
            const payment = await tx.payment.create({
                data: {
                    invoiceId: createPaymentDto.invoiceId,
                    amount: createPaymentDto.amount,
                    paymentMethod: createPaymentDto.paymentMethod,
                    reference: createPaymentDto.reference,
                    notes: createPaymentDto.notes,
                },
            });

            // Actualizar montos de la factura
            const newPaidAmount = Number(invoice.paidAmount) + createPaymentDto.amount;
            const newBalance = Number(invoice.total) - newPaidAmount;

            // Determinar nuevo estado
            let newStatus = invoice.status;
            if (newBalance === 0) {
                newStatus = 'PAID';
            } else if (newPaidAmount > 0) {
                newStatus = 'PARTIAL';
            }

            const updatedInvoice = await tx.invoice.update({
                where: { id: createPaymentDto.invoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    balance: newBalance,
                    status: newStatus,
                },
            });

            return { payment, invoice: updatedInvoice };
        });

        return result;
    }

    async getPaymentsByInvoice(invoiceId: string) {
        const payments = await this.prisma.payment.findMany({
            where: { invoiceId },
            orderBy: { paymentDate: 'desc' },
        });

        return payments;
    }

    async getAllPayments() {
        const payments = await this.prisma.payment.findMany({
            include: {
                invoice: {
                    include: {
                        client: true,
                    },
                },
            },
            orderBy: { paymentDate: 'desc' },
        });

        return payments;
    }
}
