import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from '~users/services/user.service';
import { User } from '~users/entities/user.entity';
import { CreateUserDto } from '~users/dtos/create-user.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('get-user/:email')
  async testUser(@Param('email') email: string): Promise<User | undefined> {
    return this.userService.findByEmail(email);
  }

  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create('neo4j', createUserDto);
  }
}
