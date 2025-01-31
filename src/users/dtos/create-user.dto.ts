import { IsNotEmpty, IsEmail, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  firstName?: string;
  lastName?: string;
}
