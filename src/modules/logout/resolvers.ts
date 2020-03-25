import { ResolverMap } from '../../types/gql-utils';
import { removeAllUserSessions } from '../../utils/removeAllUserSessions';

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => 'dummy'
  },
  Mutation: {
    logout: async (_, __, { redis, session }) => {
      const { userId } = session;
      if (userId) {
        removeAllUserSessions(userId, redis);
        return true;
      }

      return false;
    }
  }
};
