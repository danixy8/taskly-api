import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '~users/entities/user.entity';

@ObjectType()
export class AuthResponse {
  @Field()
  access_token: string;

  @Field(() => User)
  user: {
    id: string;
    email: string;
    dateOfBirth?: string;
    firstName?: string;
    lastName?: string;
  };
}
