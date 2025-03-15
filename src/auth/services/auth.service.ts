import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/services/user.service';
import { User } from '~users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (
      user !== undefined &&
      (await this.userService.compare(password, user.getPassword()))
    ) {
      return user;
    }
    return null;
  }

  createToken(user: User) {
    const userData = user.getUserData();

    if (!userData) {
      throw new Error('Invalid user data');
    }

    const { id, email, dateOfBirth, firstName, lastName } = userData;

    return {
      access_token: this.jwtService.sign({
        id,
        email,
        dateOfBirth,
        firstName,
        lastName,
      }),
    };
  }
}
