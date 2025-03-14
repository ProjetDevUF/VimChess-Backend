import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Handles exceptions thrown in the application and formats the HTTP response.
   *
   * @param {HttpException} exception - The exception thrown, either an instance
   * of `HttpException` or another error.
   * @param {ArgumentsHost} host - The execution context provided by NestJS, used
   * to access HTTP request and response objects.
   *
   * @returns {void} - This method sends a formatted JSON response to the client
   * and logs the error.
   *
   * The response object includes:
   * - `statusCode`: The HTTP status code derived from the exception or defaults
   *    to `500` (Internal Server Error).
   * - `timestamp`: The exact time of the error occurrence in ISO format.
   * - `path`: The URL of the route where the error occurred.
   * - `method`: The HTTP method of the request.
   * - `err`: A detailed representation of the exception object.
   *
   * The error is logged at different levels based on the HTTP status:
   * - A warning (`warn`) if the status is not 500.
   * - An error (`error`) if the status is 500.
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      err: {
        ...exception,
      },
    };

    const log = `Route: (${request.url}, ${request.method}) HTTP Status: ${status} Error Message: ${exception.message}`;
    if (status !== 500) {
      this.logger.warn(log);
    } else {
      this.logger.error(log);
    }

    response.status(status).json(errorResponse);
  }
}
