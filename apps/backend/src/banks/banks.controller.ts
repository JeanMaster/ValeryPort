
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('banks')
@UseGuards(AuthGuard('jwt'))
export class BanksController {
    constructor(private readonly banksService: BanksService) { }

    @Post()
    create(@Body() createBankDto: CreateBankAccountDto) {
        return this.banksService.create(createBankDto);
    }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.banksService.findAll(search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.banksService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBankDto: UpdateBankAccountDto) {
        return this.banksService.update(id, updateBankDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.banksService.remove(id);
    }
}
