import {User} from "../../entity/User";
import {ResolverMap} from "../../types/gql-utils";
import {createMiddleware} from "../../utils/createMiddleware";
import middleware from "./middleware";

export const resolvers: ResolverMap = {
  Query: {
    middleware: createMiddleware(middleware, (_, __, {session}) => User.findOne({
      where: {
        id: session.userId
      }
    }))
  }
};
