import * as Redis from 'ioredis';
import fetch from 'node-fetch';
import { Connection } from 'typeorm';
import { User } from '../entity/User';
import { EMAIL_CONFIRMED } from '../messages';
import { createConfirmEmailLink } from './createConfirmEmailLink';
import { createTypeORMConn } from './CreateTypeORMConn';


let userId = '';
const redis = new Redis();

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeORMConn();
  const user = await User.create({ email: 'test007@gmail.com', password: '123!@#test__pasword' }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe('Confirmation Link tests:', () => {
  it('checks user is confirmed and key is removed post-confirmation', async () => {
    const url = await createConfirmEmailLink(process.env.TEST_HOST as string, userId as string, redis);

    const response = await fetch(url);
    const text = await response.text();

    // expect a response of email confirmation
    expect(text).toEqual(EMAIL_CONFIRMED);

    const user = await User.findOne({
      where: {
        id: userId
      }
    });

    // expect the corresponding user to now be confirmed
    expect((user as User).confirmed).toBeTruthy();

    const chunks = url.split('/');
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);

    // expect redis to no longer hold the key as the email is confirmed
    expect(value).toBeNull();
  });
});
