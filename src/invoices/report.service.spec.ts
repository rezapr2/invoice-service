import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { getModelToken } from '@nestjs/mongoose';
import { Invoice } from './schemas/invoice.schema';
import { Model } from 'mongoose';

const mockInvoice = {
  _id: '1',
  customer: 'John Doe',
  amount: 100,
  reference: 'INV123',
  date: new Date(),
  items: [{ sku: 'SKU123', qt: 2 }],
};

class InvoiceModel {
  static find = jest.fn().mockReturnValue([{ ...mockInvoice }]); // Return an array with mockInvoice
}

describe('ReportService', () => {
  let service: ReportService;
  let model: Model<Invoice>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: getModelToken(Invoice.name), useValue: InvoiceModel },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    model = module.get<Model<Invoice>>(getModelToken(Invoice.name));
  });

  it('should generate and publish daily sales report', async () => {
    await service.generateDailySalesReport();
    expect(model.find).toHaveBeenCalled();
  });
});
