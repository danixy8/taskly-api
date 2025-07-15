import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import {
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Transaction } from 'neo4j-driver';
import { AuthService } from '../services/auth.service';
import { UserService } from '~users/services/user.service';
import { GqlJwtAuthGuard } from '../guards/gql-jwt-auth.guard';
import { User } from '~users/entities/user.entity';
import { GqlCurrentUser } from '~auth/decorators/current-user.decorator';
import { CreateUserDto } from '~users/dtos/create-user.dto';
import { LoginDto } from '~auth/dto/login.dto';
import { AuthResponse } from '~auth/dto/auth.response.dto';
import { Neo4jGqlTransactionInterceptor } from '~shared/database/neo4j/src/interceptors/neo4j-gql-transaction.interceptor';

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => User)
  @UseGuards(GqlJwtAuthGuard)
  currentUser(@GqlCurrentUser() user: User) {
    const { access_token } = this.authService.createToken(user);
    return {
      ...user.getUserData(),
      access_token,
    };
  }

  @Mutation(() => AuthResponse)
  @UseInterceptors(Neo4jGqlTransactionInterceptor)
  @UsePipes(ValidationPipe)
  async register(
    @Args('input') createUserDto: CreateUserDto,
    @Context() context,
  ) {
    const transaction: Transaction = context.req.transaction;
    const user = await this.userService.create(transaction, createUserDto);
    const { access_token } = this.authService.createToken(user);
    return {
      access_token,
      user: user.getUserData(),
    };
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') loginInput: LoginDto) {
    const user = await this.authService.validateUser(
      loginInput.email,
      loginInput.password,
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const { access_token } = this.authService.createToken(user);
    return {
      access_token,
      user: user.getUserData(),
    };
  }
}
