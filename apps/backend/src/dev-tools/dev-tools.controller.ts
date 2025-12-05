import { Controller, Post, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevToolsService } from './dev-tools.service';

@ApiTags('dev-tools')
@Controller('dev-tools')
export class DevToolsController {
    constructor(private readonly devToolsService: DevToolsService) { }

    @Post('reset-database')
    @HttpCode(200)
    @ApiOperation({ summary: 'Resetear base de datos (SOLO DESARROLLO)' })
    @ApiResponse({ status: 200, description: 'Base de datos reseteada' })
    @ApiResponse({ status: 500, description: 'Error al resetear' })
    async resetDatabase() {
        return this.devToolsService.resetDatabase();
    }
}
