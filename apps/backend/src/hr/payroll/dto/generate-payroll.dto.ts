import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class GeneratePayrollDto {
    @IsNotEmpty()
    @IsString()
    payrollPeriodId: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    employeeIds?: string[];
}
