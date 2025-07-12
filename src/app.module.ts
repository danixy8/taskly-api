import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Neo4jModule } from '~shared/database/neo4j/neo4j.module';
import { Neo4jConfig } from '~shared/database/neo4j/src/interfaces/neo4j-config.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';
import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
class TestResolver {
  @Query(() => String)
  hello() {
    return 'testing graphQL server' + new Date().toISOString();
  }
}

@Module({
  imports: [
    // databaseConfig,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      context: ({ req }) => ({ req }),
      debug: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
    }),
    Neo4jModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Neo4jConfig => ({
        scheme: configService.get('NEO4J_SCHEME'),
        host: configService.get('NEO4J_HOST'),
        port: configService.get('NEO4J_PORT'),
        username: configService.get('NEO4J_USERNAME'),
        password: configService.get('NEO4J_PASSWORD'),
        database: configService.get('NEO4J_DATABASE'),
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, TestResolver],
})
export class AppModule {}
