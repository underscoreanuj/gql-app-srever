import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { createTypeORMConn } from '../../utils/CreateTypeORMConn';
import { TestClient } from '../../utils/TestClient';


let conn: Connection;
let userId: string;
const email = 'logouttest@gmail.com';
const pass = 'test_pass_123123';

beforeAll(async () => {
  conn = await createTypeORMConn();
  const user = await User.create({ email, password: pass, confirmed: true }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe('Logout tests:', () => {
  it('single session logout works', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // login user
    await client.login(email, pass);

    // get session cookie for the same user
    const responsePostLogin = await client.middleware();

    // expect logged-in session to be present
    expect(responsePostLogin.data).toEqual({
      middleware: {
        id: userId,
        email
      }
    });

    // logout
    await client.logout();

    //  get session cookie for the same user
    const responsePostLogout = await client.middleware();

    //  expect session cookie for that user to be destroyed
    expect(responsePostLogout.data.middleware).toBeNull();
  });

  it('multiple session logout works', async () => {
    // device instance 1
    const sessClient1 = new TestClient(process.env.TEST_HOST as string);
    // device instance 2
    const sessClient2 = new TestClient(process.env.TEST_HOST as string);

    await sessClient1.login(email, pass);
    await sessClient2.login(email, pass);

    // both sessions point to the same user id
    expect(await sessClient1.middleware()).toEqual(await sessClient2.middleware());

    await sessClient1.logout();

    // both sessions point to be logged out and be null
    expect(await sessClient1.middleware()).toEqual(await sessClient2.middleware());
  });
});
