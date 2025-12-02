import { IsString, IsEmail, IsOptional, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
    @ApiProperty({ example: 'J-12345678-9', description: 'RIF del cliente (único)' })
    @IsNotEmpty({ message: 'El RIF es requerido' })
    @IsString()
    @Length(10, 12, { message: 'El RIF debe tener entre 10 y 12 caracteres' })
    rif: string;

    @ApiProperty({ example: 'Ferretería El Tornillo', description: 'Nombre comercial' })
    @IsNotEmpty({ message: 'El nombre comercial es requerido' })
    @IsString()
    comercialName: string;

    @ApiProperty({ example: 'Ferretería El Tornillo C.A.', required: false })
    @IsOptional()
    @IsString()
    legalName?: string;

    @ApiProperty({ example: 'Av. Principal, Caracas', required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ example: '+58 412-1234567', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'contacto@ferreteria.com', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'Email inválido' })
    email?: string;
}
