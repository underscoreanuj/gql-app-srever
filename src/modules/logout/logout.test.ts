import {Connection} from "typeorm";

import {User} from "../../entity/User";
import {createTypeORMConn} from "../../utils/CreateTypeORMConn";
import {TestClient} from "../../utils/TestClient";

let conn: Connection;
let userId: String;
const email = "logouttest@gmail.com";
const pass = "test_pass_123123";

beforeAll(async () => {
  conn = await createTypeORMConn();
  const user = await User.create({email: email, password: pass, confirmed: true}).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe("Logout tests:", () => {
  it("logging out works", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // login user
    await client.login(email, pass);

    // get session cookie for the same user
    const response_post_login = await client.middleware();

    // expect logged-in session to be present
    expect(response_post_login.data).toEqual({
      middleware: {
        id: userId,
        email: email
      }
    });

    // logout
    await client.logout();

    //  get session cookie for the same user
    const response_post_logout = await client.middleware();

    //  expect session cookie for that user to be destroyed
    expect(response_post_logout.data.middleware).toBeNull();
  });
});
