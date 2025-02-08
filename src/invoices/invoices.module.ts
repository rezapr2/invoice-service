import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { ScheduleModule } from '@nestjs/schedule'; 
import { ReportService } from './report.service'; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    ScheduleModule.forRoot(),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, ReportService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
