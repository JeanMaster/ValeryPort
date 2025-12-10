import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductsModule } from './products/products.module';
import { CompanySettingsModule } from './company-settings/company-settings.module';
import { DepartmentsModule } from './departments/departments.module';
import { UnitsModule } from './units/units.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { SalesModule } from './sales/sales.module';
import { InvoiceModule } from './invoice/invoice.module';
import { DevToolsController } from './dev-tools/dev-tools.controller';
import { DevToolsService } from './dev-tools/dev-tools.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ClientsModule,
    SuppliersModule,
    ProductsModule,
    CompanySettingsModule,
    DepartmentsModule,
    UnitsModule,
    CurrenciesModule,
    SalesModule,
    InvoiceModule,
  ],
  controllers: [AppController, DevToolsController],
  providers: [AppService, DevToolsService],
})
export class AppModule { }
