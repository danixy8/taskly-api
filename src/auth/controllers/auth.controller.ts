import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Transaction } from 'neo4j-driver';
import { CreateUserDto } from '~users/dtos/create-user.dto';
import { UserService } from '~users/services/user.service';
import { AuthService } from '~auth/services/auth.service';
import { Neo4jTransactionInterceptor } from '~shared/database/neo4j/src/interceptors/neo4j-transaction.interceptor';
import { JwtAuthGuard } from '~auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from '~auth/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @UseInterceptors(Neo4jTransactionInterceptor)
  @UsePipes(ValidationPipe)
  @Post('register')
  async postRegister(@Body() createUserDto: CreateUserDto, @Request() req) {
    const transaction: Transaction = req.transaction;

    const user = await this.userService.create(transaction, createUserDto);

    const { access_token } = await this.authService.createToken(user);

    const userData = user.getUserData();

    return { ...userData, access_token };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async postLogin(@Request() request) {
    const { access_token } = await this.authService.createToken(request.user);

    const { id, email, dateOfBirth } = request.user.node.properties;

    return {
      id,
      email,
      dateOfBirth,
      access_token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUser(@Request() request) {
    const { access_token } = await this.authService.createToken(request.user);
    const { id, email, dateOfBirth } = request.user.node.properties;

    return {
      id,
      email,
      dateOfBirth,
      access_token,
    };
  }
}
