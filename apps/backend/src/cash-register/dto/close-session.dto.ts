import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CloseSessionDto {
    @ApiProperty({ description: 'Saldo real contado' })
    @IsNumber()
    @Min(0)
    actualBalance: number;

    @ApiProperty({ description: 'Usuario que cierra', required: false })
    @IsOptional()
    @IsString()
    closedBy?: string;

    @ApiProperty({ description: 'Notas de cierre', required: false })
    @IsOptional()
    @IsString()
    closingNotes?: string;
}
