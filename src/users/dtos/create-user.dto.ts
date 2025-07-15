import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsEmail, IsDateString } from 'class-validator';

@InputType()
export class CreateUserDto {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  password: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @Field()
  firstName?: string;

  @Field()
  lastName?: string;
}
