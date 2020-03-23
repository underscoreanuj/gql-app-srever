import {Connection} from "typeorm";

import {User} from "../../entity/User";
import {createTypeORMConn} from "../../utils/CreateTypeORMConn";
import {TestClient} from "../../utils/TestClient";

let conn: Connection;
let userId: String;
const email = "middlewaretest@gmail.com";
const pass = "test_pass_123123";

beforeAll(async () => {
  conn = await createTypeORMConn();
  const user = await User.create({email: email, password: pass, confirmed: true}).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe("Middleware tests:", () => {
  it("return null if no cookie", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // call middleware without login
    const response = await client.middleware();
    expect(response.data.middleware).toBeNull();
  });

  it("get current user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // login
    await client.login(email, pass);

    // call middleware
    const response = await client.middleware();

    // expect session to have the logged-in user id
    expect(response.data).toEqual({
      middleware: {
        id: userId,
        email: email
      }
    });
  });
});
