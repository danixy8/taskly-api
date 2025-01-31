import { Injectable } from '@nestjs/common';
import { Transaction } from 'neo4j-driver';
import { Neo4jService } from '~shared/database/neo4j/src/services/neo4j.service';
import { User } from '../entities/user.entity';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from '~users/dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async hash(plain: string): Promise<string> {
    return await hash(plain, 10);
  }

  async compare(plain: string, encrypted: string): Promise<boolean> {
    return await compare(plain, encrypted);
  }

  private hydrate(res): User {
    if (!res.records.length) {
      return undefined;
    }

    const user = res.records[0].get('u');

    return new User(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const res = await this.neo4jService.read(
      `
            MATCH (u:User {email: $email})
            RETURN u
        `,
      { email },
    );

    return this.hydrate(res);
  }

  async create(
    databaseOrTransaction: string | Transaction,
    createUserDto: CreateUserDto,
  ): Promise<User> {
    const res = await this.neo4jService.write(
      `
      CREATE (u:User {email: $email, password: $password, dateOfBirth: $dateOfBirth, firstName: $firstName, lastName: $lastName})
      SET u.id = randomUUID()
      RETURN u
      `,
      {
        email: createUserDto.email,
        password: await this.hash(createUserDto.password),
        dateOfBirth: new Date(createUserDto.dateOfBirth).toISOString(),
        firstName: createUserDto.firstName || null,
        lastName: createUserDto.lastName || null,
      },
      databaseOrTransaction,
    );

    return this.hydrate(res);
  }
}
