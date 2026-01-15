import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { GqlJwtAuthGuard } from '~auth/guards/gql-jwt-auth.guard';
import { GqlCurrentUser } from '~auth/decorators/current-user.decorator';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  @UseGuards(GqlJwtAuthGuard)
  async users(): Promise<any[]> {
    return this.userService.findAllGraphQL();
  }

  @Mutation(() => User)
  @UseGuards(GqlJwtAuthGuard)
  @UsePipes(ValidationPipe)
  async updateProfile(
    @Args('input') updateUserDto: UpdateUserDto,
    @GqlCurrentUser() user: User,
  ) {
    return this.userService.updateGraphQL(user.getId(), updateUserDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deleteAccount(@GqlCurrentUser() user: User): Promise<boolean> {
    return this.userService.delete(user.getId());
  }
}
