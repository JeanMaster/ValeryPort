import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Injectable()
export class CompanySettingsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Obtener configuración de la empresa (singleton)
     * Si no existe, crea una por defecto
     */
    async getSettings() {
        let settings = await this.prisma.companySettings.findFirst();

        // Si no existe, crear configuración por defecto
        if (!settings) {
            settings = await this.prisma.companySettings.create({
                data: {
                    name: 'Zenith',
                    rif: 'J-00000000-0',
                    logoUrl: null,
                },
            });
        }

        return settings;
    }

    /**
     * Actualizar configuración de la empresa
     */
    async updateSettings(dto: UpdateCompanySettingsDto) {
        // Obtener el único registro (o crearlo si no existe)
        const existing = await this.getSettings();

        // Actualizar
        return this.prisma.companySettings.update({
            where: { id: existing.id },
            data: dto,
        });
    }
}
