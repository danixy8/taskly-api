import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserData {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date;
}
