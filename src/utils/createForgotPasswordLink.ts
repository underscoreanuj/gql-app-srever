import { Redis } from 'ioredis';
import { v4 } from 'uuid';
import { FORGOT_PASSWORD_PREFIX } from '../constants';


export const createForgotPasswordLink = async (url: string, userId: string, redis: Redis) => {
  const id = v4();
  await redis.set(`${FORGOT_PASSWORD_PREFIX}${id}`, userId, 'ex', 60 * 20); // valid for only 20 minutes
  return `${url}/forgot-password/${id}`;
};
