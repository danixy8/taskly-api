import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Node } from 'neo4j-driver';
import { UserData } from '~users/dtos/user-data.dto';

@ObjectType()
export class User {
  constructor(private readonly node: Node) {}

  @Field(() => ID)
  getId(): string {
    return (<Record<string, any>>this.node.properties).id;
  }

  getPassword(): string {
    return (<Record<string, any>>this.node.properties).password;
  }

  @Field(() => UserData)
  getUserData(): UserData {
    const { id, email, dateOfBirth, firstName, lastName } = <
      Record<string, any>
    >this.node.properties;
    return { id, email, dateOfBirth, firstName, lastName };
  }
}
