import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseWSMessagePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): object {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as object;
      } catch (error) {
        throw new BadRequestException('Invalid JSON format');
      }
    }

    return (value || {}) as object;
  }
}
