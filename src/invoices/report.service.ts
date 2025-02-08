import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from './schemas/invoice.schema';
import * as amqplib from 'amqplib';
import { LoggerService } from '../logger/logger.service'; 

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    private readonly logger: LoggerService,  // Inject custom logger
  ) {}

  @Cron('0 12 * * *') // Runs daily at 12:00 PM server time
  async generateDailySalesReport() {
    this.logger.log('Generating daily sales report...');

    try {
      // Get today's date in UTC (Ensure timezone consistency)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch invoices created today
      const invoices = await this.invoiceModel.find({ date: { $gte: today } }).exec();

      if (invoices.length === 0) {
        this.logger.log('No sales data found for today.');
        return;
      }

      // Calculate total sales amount
      const totalSales = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

      // Aggregate sales data by SKU
      const itemSummary = invoices.flatMap(invoice => invoice.items)
        .reduce((acc, item) => {
          acc[item.sku] = (acc[item.sku] || 0) + item.qt;
          return acc;
        }, {});

      const summary = { totalSales, itemSummary, date: today.toISOString() };

      this.logger.log(`Sales report generated: ${JSON.stringify(summary)}`);

      // Publish report to RabbitMQ
      await this.publishSalesReportToQueue(summary);
      this.logger.log('Daily sales report successfully published to RabbitMQ');
    } catch (error) {
      this.logger.error('Error generating sales report:', error.stack);
    }
  }

  // Method to publish report to RabbitMQ
  async publishSalesReportToQueue(summary: any) {
    try {
      const connection = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      const channel = await connection.createChannel();
      await channel.assertQueue('daily_sales_report');

      channel.sendToQueue('daily_sales_report', Buffer.from(JSON.stringify(summary)));

      this.logger.log(`Published daily sales report to RabbitMQ: ${JSON.stringify(summary)}`);

      await channel.close();
      await connection.close();
    } catch (error) {
      this.logger.error('Failed to publish sales report to RabbitMQ:', error.stack);
    }
  }
}
