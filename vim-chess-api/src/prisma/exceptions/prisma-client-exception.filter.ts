import {ArgumentsHost, Catch, HttpStatus} from '@nestjs/common';
import {BaseExceptionFilter} from '@nestjs/core';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {Response} from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        console.error(exception.message);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const message = exception.message.replace(/\n/g, '');

        switch (exception.code) {
            case 'P2002': {
                const status = HttpStatus.CONFLICT;

                response.status(status).json({
                    statusCode: status,
                    message: message,
                });
                break;
            }
            default:
                super.catch(exception, host);
                break;
        }
    }
}
