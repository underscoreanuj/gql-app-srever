import * as Redis from 'ioredis';
import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { createTypeORMConn } from '../../utils/CreateTypeORMConn';
import { TestClient } from '../../utils/TestClient';
import { forgotPasswordAccountLockedError } from '../login/errorMessages';
import { passwordNotLongEnough } from '../register/errorMessages';
import { createForgotPasswordLink } from './createForgotPasswordLink';
import { expiredKeyError } from './errorMessages';
import { forgotPasswordLockAccount } from './forgotPasswordLockAccount';


let userId = '';
const redis = new Redis();
let conn: Connection;
const email = 'forgotpasstest@gmail.com';
const pass = '123!@#test__pasword';
const newPass = 'new_password_for_forgot_password';

beforeAll(async () => {
  conn = await createTypeORMConn();
  const user = await User.create({ email, password: pass, confirmed: true }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe('Forgot Password Link tests:', () => {
  it('checks forgot password works', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // lock account
    await forgotPasswordLockAccount(userId, redis);

    // create password reset link
    const url = await createForgotPasswordLink(process.env.TEST_HOST as string, userId as string, redis);
    const chunks = url.split('/');
    const key = chunks[chunks.length - 1];

    // ensure one cannot login into a locked account
    expect(await client.login(email, pass)).toEqual({
      data: {
        login: [
          {
            path: 'email',
            message: forgotPasswordAccountLockedError
          }
        ]
      }
    });

    // bad password should not work
    expect(await client.forgotPasswordChange('bad', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'new_password',
            message: passwordNotLongEnough
          }
        ]
      }
    });

    const response = await client.forgotPasswordChange(newPass, key);

    // ensure changing the password works
    expect(response.data).toEqual({ forgotPasswordChange: null });

    // ensure redis expires the key after the password is changed
    expect(await client.forgotPasswordChange('new_password_another_attempt', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'key',
            message: expiredKeyError
          }
        ]
      }
    });

    // login using new password should work
    expect(await client.login(email, newPass)).toEqual({
      data: {
        login: null
      }
    });
  });
});
