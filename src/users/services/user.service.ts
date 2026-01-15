import { Injectable, ConflictException } from '@nestjs/common';
import { Transaction } from 'neo4j-driver';
import { Neo4jService } from '~shared/database/neo4j/src/services/neo4j.service';
import { User } from '../entities/user.entity';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from '~users/dtos/create-user.dto';
import { UpdateUserDto } from '~users/dtos/update-user.dto';

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

  private hydrateMany(res): User[] {
    return res.records.map((record) => new User(record.get('u')));
  }

  private toGraphQL(user: User): any {
    return {
      getId: user.getId(),
      getUserData: user.getUserData(),
    };
  }

  private toGraphQLMany(users: User[]): any[] {
    return users.map((user) => this.toGraphQL(user));
  }

  async findById(id: string): Promise<User | undefined> {
    const res = await this.neo4jService.read(
      `
    MATCH (u:User {id: $id})
    RETURN u
    `,
      { id },
    );

    return this.hydrate(res);
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

  async findAll(): Promise<User[]> {
    const res = await this.neo4jService.read(
      `
      MATCH (u:User {isActive: true})
      RETURN u
      `,
    );

    return this.hydrateMany(res);
  }

  async create(
    databaseOrTransaction: string | Transaction,
    createUserDto: CreateUserDto,
  ): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(
        `Email "${createUserDto.email}" ya está registrado`,
      );
    }

    const res = await this.neo4jService.write(
      `
      CREATE (u:User {email: $email, password: $password, dateOfBirth: $dateOfBirth, firstName: $firstName, lastName: $lastName, isActive: true})
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updateData: any = {};

    if (updateUserDto.firstName !== undefined) {
      updateData.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName !== undefined) {
      updateData.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.dateOfBirth !== undefined) {
      updateData.dateOfBirth = new Date(
        updateUserDto.dateOfBirth,
      ).toISOString();
    }

    const setClause = Object.keys(updateData)
      .map((key) => `u.${key} = $${key}`)
      .join(', ');

    if (!setClause) {
      return this.findById(id);
    }

    const res = await this.neo4jService.write(
      `
      MATCH (u:User {id: $id})
      SET ${setClause}
      RETURN u
      `,
      { id, ...updateData },
    );

    return this.hydrate(res);
  }

  async findAllGraphQL(): Promise<any[]> {
    const users = await this.findAll();
    return this.toGraphQLMany(users);
  }

  async updateGraphQL(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.update(id, updateUserDto);
    return this.toGraphQL(user);
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.neo4jService.write(
      `
      MATCH (u:User {id: $id})
      SET u.isActive = false
      RETURN u
      `,
      { id },
    );

    return res.records.length > 0;
  }
}
