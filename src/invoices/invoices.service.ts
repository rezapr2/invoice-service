import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(@InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>) {}
  
  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const newInvoice = new this.invoiceModel(createInvoiceDto);
    return newInvoice.save();
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }
 
  async findAll(query?: any): Promise<Invoice[]> {
    return this.invoiceModel.find().exec();
  }

}
