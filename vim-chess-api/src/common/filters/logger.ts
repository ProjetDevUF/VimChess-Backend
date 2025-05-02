import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger(LoggerService.name);
  }

  setContext(name: string) {
    this.logger = new Logger(name);
  }

  log(message: string) {
    this.logger.log(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  error(message: string) {
    this.logger.error(message);
  }
}
