import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    getDashboardStats() {
        return this.statsService.getDashboardStats();
    }

    @Get('inventory')
    @ApiOperation({ summary: 'Get inventory report' })
    getInventoryReport() {
        return this.statsService.getInventoryReport();
    }

    @Get('finance')
    @ApiOperation({ summary: 'Get finance report' })
    getFinanceReport() {
        return this.statsService.getFinanceReport();
    }
}
