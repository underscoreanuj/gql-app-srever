import { GraphQLMiddleware, Resolver } from '../../types/gql-utils';

export const createMiddleware = (middlewareFunc: GraphQLMiddleware, resolverFunc: Resolver) =>
    (parent: any, args: any, context: any, info: any) =>
        middlewareFunc(resolverFunc, parent, args, context, info);
