import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Neo4jService } from '../services/neo4j.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Transaction } from 'neo4j-driver';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class Neo4jGqlTransactionInterceptor implements NestInterceptor {
  constructor(private readonly neo4jService: Neo4jService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const req = gqlContext.getContext().req;
    const transaction: Transaction = this.neo4jService.beginTransaction();
    req.transaction = transaction;

    try {
      const result = await lastValueFrom(next.handle());
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
