import { BadRequestException, ValidationError } from '@nestjs/common';
import { ERROR } from '../constants/error.constants';

/**
 * ExceptionFactory personnalisée pour capturer et formater les erreurs de validation.
 * Elle est utilisée par le ValidationPipe.
 */
export function customValidationExceptionFactory(
  validationErrors: ValidationError[],
): BadRequestException {
  const missingFieldsErrors = validationErrors.filter(
    (err) => err.constraints && err.constraints.isNotEmpty,
  );

  const invalidFormatErrors = validationErrors.filter(
    (err) =>
      err.constraints &&
      (err.constraints.minLength ||
        err.constraints.maxLength ||
        err.constraints.isString ||
        err.constraints.isBoolean),
  );

  if (missingFieldsErrors.length) {
    return new BadRequestException({
      ...ERROR.MissingFields,
      fields: missingFieldsErrors.map((err) => err.property),
    });
  }

  if (invalidFormatErrors.length) {
    return new BadRequestException({
      ...ERROR.InvalidInputFormat,
      fields: invalidFormatErrors.map((err) => ({
        field: err.property,
        errors: Object.values(err.constraints || {}),
      })),
    });
  }

  return new BadRequestException({
    ...ERROR.InvalidInputFormat,
    message: 'Invalid request data format.',
  });
}
