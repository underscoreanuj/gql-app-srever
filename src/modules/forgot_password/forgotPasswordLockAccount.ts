import { Redis } from 'ioredis';
import { User } from '../../entity/User';
import { removeAllUserSessions } from '../../utils/removeAllUserSessions';


export const forgotPasswordLockAccount = async (userId: string, redis: Redis) => {
  // ensure user can no longer login (LOCK account)
  await User.update({
    id: userId
  }, { forgotPasswordLocked: true });

  // remove all user sessions logging-out from all existing login sessions
  removeAllUserSessions(userId, redis);
};
