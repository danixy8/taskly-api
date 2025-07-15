// src/auth/decorators/gql-current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '~users/entities/user.entity';

export const GqlCurrentUser = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    return data ? user?.[data] : user;
  },
);
