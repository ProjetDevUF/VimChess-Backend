import {
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { LoggerService } from './logger';

@Catch(BadRequestException, NotFoundException, ConflictException)
export class WsValidationFilter extends BaseWsExceptionFilter {
  logger = new LoggerService();

  constructor() {
    super();
    this.logger.setContext(WsValidationFilter.name);
  }

  /**
   * Handles WebSocket exceptions and formats a response for the client.
   *
   * @param {WsException | Error} exception - The exception thrown.
   * @param {ArgumentsHost} host - The WebSocket execution context.
   *
   * @returns {void} - Sends a formatted JSON response to the WebSocket client
   * and logs the error or warning details.
   */

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient();
    const data = ctx.getData();

    const isWsException = exception instanceof WsException;
    const status = isWsException ? 'warning' : 'error';

    const errorResponse = {
      event: 'exception',
      timestamp: new Date().toISOString(),
      message: isWsException ? exception.getError() : 'Internal Server Error',
      details: isWsException ? exception.getResponse() : exception.message,
      dataSent: data,
    };

    const logMessage = `WebSocket Error: ${JSON.stringify(errorResponse)}`;
    if (status === 'warning') {
      this.logger.warn(logMessage);
    } else {
      this.logger.error(logMessage);
    }

    client.emit('error', errorResponse);
  }
}
