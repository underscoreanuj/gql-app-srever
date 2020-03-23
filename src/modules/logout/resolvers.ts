import {REDIS_SESSION_PREFIX, USER_SESSION_ID_PREFIX} from "../../constants";
import {ResolverMap} from "../../types/gql-utils";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: async (_, __, {redis, session}) => {
      const {userId} = session;
      if (userId) {
        // fetch all sessions of the user
        const sessionIds = await redis.lrange(`${USER_SESSION_ID_PREFIX}${userId}`, 0, -1);

        // used to delete all sessions to be deleted in parallel
        const promises = [];
        // delete all sessions of the user
        for (let i = 0; i < sessionIds.length; i += 1) {
          promises.push(redis.del(`${REDIS_SESSION_PREFIX}${sessionIds[i]}`));
        }
        // await here instead of inside the loop to allow deletion to be executed in parellel
        await Promise.all(promises);

        return true;
      }

      return false;
    }
  }
};
