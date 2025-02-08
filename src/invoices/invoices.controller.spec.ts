import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesModule } from './invoices.module';
import { InvoiceSchema, Invoice } from './schemas/invoice.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('InvoicesController (e2e)', () => {
  let app: INestApplication;
  let invoiceModel: Model<Invoice>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/invoiceDB'),
        InvoicesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    invoiceModel = moduleFixture.get<Model<Invoice>>(getModelToken(Invoice.name));
    await invoiceModel.deleteMany({});
  });

  afterAll(async () => {
    await invoiceModel.deleteMany({});
    await app.close();
  });

  const mockInvoice = {
    customer: 'Jane Doe',
    amount: 200,
    reference: 'INV456',
    items: [{ sku: 'SKU456', qt: 3 }],
  };

  let createdInvoiceId: string;

  it('POST /invoices - should create an invoice', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .send(mockInvoice)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.customer).toBe(mockInvoice.customer);
    createdInvoiceId = res.body._id;
  });

  it('GET /invoices - should retrieve all invoices', async () => {
    const res = await request(app.getHttpServer()).get('/invoices').expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /invoices/:id - should retrieve a specific invoice', async () => {
    const res = await request(app.getHttpServer()).get(`/invoices/${createdInvoiceId}`).expect(200);
    expect(res.body._id).toBe(createdInvoiceId);
  });

  it('GET /invoices/:id - should return 404 for a non-existent invoice', async () => {
    await request(app.getHttpServer()).get('/invoices/999999999999999999999999').expect(404);
  });
});
