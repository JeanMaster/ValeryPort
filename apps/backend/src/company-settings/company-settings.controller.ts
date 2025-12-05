import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@ApiTags('company-settings')
@Controller('company-settings')
export class CompanySettingsController {
    constructor(private readonly companySettingsService: CompanySettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Obtener configuración de la empresa' })
    @ApiResponse({ status: 200, description: 'Configuración obtenida' })
    getSettings() {
        return this.companySettingsService.getSettings();
    }

    @Put()
    @ApiOperation({ summary: 'Actualizar configuración de la empresa' })
    @ApiResponse({ status: 200, description: 'Configuración actualizada' })
    updateSettings(@Body() updateDto: UpdateCompanySettingsDto) {
        return this.companySettingsService.updateSettings(updateDto);
    }
}
