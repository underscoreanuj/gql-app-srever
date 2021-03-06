import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';
import { FORGOT_PASSWORD_PREFIX } from '../../constants';
import { User } from '../../entity/User';
import { ResolverMap } from '../../types/gql-utils';
import { formatYupError } from '../../utils/formatYupError';
import { passwordValidator } from '../../utils/yupSchemas';
import { createForgotPasswordLink } from './createForgotPasswordLink';
import { accountDoesntExist, expiredKeyError } from './errorMessages';
import { forgotPasswordLockAccount } from './forgotPasswordLockAccount';


const schema = yup.object().shape({ new_password: passwordValidator });

export const resolvers: ResolverMap = {
  Query: {
    bye_fp: () => 'bye_forgot_pass'
  },
  Mutation: {
    sendForgotPasswordEmail: async (_, { email }: GQL.ISendForgotPasswordEmailOnMutationArguments, { redis }) => {
      const user = await User.findOne({
        where: {
          email
        }
      });

      if (!user) {
        return [
          {
            path: 'email',
            message: accountDoesntExist
          }
        ];
      }

      // lock the account + logout of all sessions
      await forgotPasswordLockAccount(user.id, redis);

      // TODO: add the correct frontend host & send the email to the url
      const url = await createForgotPasswordLink(process.env.FRONTEND_HOST as string, user.id, redis);
      console.log(url);

      return true;
    },
    forgotPasswordChange: async (_, { new_password, key }: GQL.IForgotPasswordChangeOnMutationArguments, { redis }) => {
      const redisKey = `${FORGOT_PASSWORD_PREFIX}${key}`;

      const userId = await redis.get(redisKey);
      if (!userId) {
        return [
          {
            path: 'key',
            message: expiredKeyError
          }
        ];
      }

      try {
        await schema.validate({
          new_password
        }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      // hash the new password
      const newPasswordHashed = await bcrypt.hash(new_password, 10);

      // unlock account and update password
      const updatePasswordAndLockPromise = User.update({
        id: userId
      }, {
        forgotPasswordLocked: false,
        password: newPasswordHashed
      });

      // delete the key from redis to invalidate the password reset link
      const deleteKeyPromise = redis.del(redisKey);

      await Promise.all([updatePasswordAndLockPromise, deleteKeyPromise]);

      return true;
    }
  }
};
