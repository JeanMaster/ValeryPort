import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) { }

  async create(createExpenseDto: CreateExpenseDto) {
    return (this.prisma as any).expense.create({
      data: {
        description: createExpenseDto.description,
        amount: createExpenseDto.amount,
        date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
        category: createExpenseDto.category,
        paymentMethod: createExpenseDto.paymentMethod,
        reference: createExpenseDto.reference,
        notes: createExpenseDto.notes,
      },
    });
  }

  async findAll() {
    return (this.prisma as any).expense.findMany({
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const expense = await (this.prisma as any).expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(id); // Check existence

    return (this.prisma as any).expense.update({
      where: { id },
      data: {
        description: updateExpenseDto.description,
        amount: updateExpenseDto.amount,
        date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : undefined,
        category: updateExpenseDto.category,
        paymentMethod: updateExpenseDto.paymentMethod,
        reference: updateExpenseDto.reference,
        notes: updateExpenseDto.notes,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence
    return (this.prisma as any).expense.delete({
      where: { id },
    });
  }
}
