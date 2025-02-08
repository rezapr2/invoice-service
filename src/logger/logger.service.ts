import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  log(message: string) {
    super.log(`[INFO] ${message}`);
  }

  error(message: string, trace?: string) {
    super.error(`[ERROR] ${message}`, trace);
  }
}
