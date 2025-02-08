import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { Invoice } from './schemas/invoice.schema';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

const mockInvoice = {
  _id: '1',
  customer: 'John Doe',
  amount: 100,
  reference: 'INV123',
  date: new Date(),
  items: [{ sku: 'ABC123', qt: 2 }],
};

class InvoiceModel {
  constructor(private data) {}
  save = jest.fn().mockResolvedValue(mockInvoice);
  static find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockInvoice]) });
  static findById = jest.fn().mockImplementation((id) => ({
    exec: jest.fn().mockResolvedValue(mockInvoice),
  }));

}

describe('InvoicesService', () => {
  let service: InvoicesService;
  let model: Model<Invoice>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getModelToken(Invoice.name), useValue: InvoiceModel },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    model = module.get<Model<Invoice>>(getModelToken(Invoice.name));
  });

  it('should create an invoice', async () => {
    const result = await service.create(mockInvoice);
    expect(result).toEqual(mockInvoice);
  });

  it('should find one invoice by ID', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual(mockInvoice);
  });

  it('should retrieve all invoices', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockInvoice]);
  });
  
});
