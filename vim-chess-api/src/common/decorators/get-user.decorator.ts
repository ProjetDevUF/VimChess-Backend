import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * A custom decorator in NestJS to retrieve the current authenticated user
 * or a specific property of the user from the request object.
 *
 * @param {keyof User | undefined} data - The specific property of the user to retrieve.
 * If `data` is not provided, it returns the entire user object.
 * @param {ExecutionContext} ctx - The execution context provided by NestJS, used to
 * access the HTTP request.
 * @returns {User | User[keyof User] | undefined} - Returns the full user object if
 * `data` is not specified, a specific user property if `data` is provided, or `undefined`
 * if no user is found.
 */
export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      return undefined;
    }
    if (request.user && data) {
      return (request.user as User)[data];
    }
    return request.user as User;
  },
);
