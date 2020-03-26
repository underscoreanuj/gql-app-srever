import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { createTestTypeORMConn } from '../../testUtils/createTestTypeORMConn';
import { TestClient } from '../../utils/TestClient';
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';


let conn: Connection;
const email = 'test009@gmail.com';
const pass = 'testing_password';

beforeAll(async () => {
  conn = await createTestTypeORMConn();
});

afterAll(async () => {
  conn.close();
});

describe('Register user tests:', () => {
  it('add a newuser & check for duplicate emails', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // ensure adding a new user is successfull
    const response = await client.register(email, pass);

    expect(response.data).toEqual({ register: null });
    const users = await User.find({
      where: {
        email
      }
    });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(pass);

    // ensure adding the same email gives a email already exists error
    const anotherResponse = await client.register(email, pass);

    expect(anotherResponse.data.register).toHaveLength(1);
    expect(anotherResponse.data.register[0]).toEqual({ path: 'email', message: duplicateEmail });
  });

  it('checks for bad email', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // ensure invalid email is caught
    const yupInvalidEmailResponse = await client.register('test', pass);

    expect(yupInvalidEmailResponse.data).toEqual({
      register: [
        {
          path: 'email',
          message: emailNotLongEnough
        }, {
          path: 'email',
          message: invalidEmail
        }
      ]
    });
  });

  it('checks for bad password', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // ensure invalid password is caught
    const yupBadPassResponse = await client.register(email, 'pass');

    expect(yupBadPassResponse.data).toEqual({
      register: [
        {
          path: 'password',
          message: passwordNotLongEnough
        }
      ]
    });
  });

  it('checks for bad email & password', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // ensure invalid password and email is caught
    const yupBadPassAndEmailResponse = await client.register('test', 'pass');

    expect(yupBadPassAndEmailResponse.data).toEqual({
      register: [
        {
          path: 'email',
          message: emailNotLongEnough
        }, {
          path: 'email',
          message: invalidEmail
        }, {
          path: 'password',
          message: passwordNotLongEnough
        }
      ]
    });
  });
});
