import {Connection} from "typeorm";

import {User} from "../../entity/User";
import {createTypeORMConn} from "../../utils/CreateTypeORMConn";
import {TestClient} from "../../utils/TestClient";
import {confirmEmailError, invalidLoginInfo} from "./errorMessages";

let conn: Connection;
const email = "logintest009@gmail.com";
const pass = "testing_password";

beforeAll(async () => {
  conn = await createTypeORMConn();
});

afterAll(async () => {
  conn.close();
});

const login = async (client : TestClient, e : string, p : string, errMsg : string) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

describe("Login Tests:", () => {
  it("checks unregistered email cannot login", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // expect unregistered emails cannot login
    await login(client, "unregisteredemail@gmail.com", "unregistered_pass", invalidLoginInfo);
  });

  it("checks unconfirmed emails/bad password cannot login & valid & confirmed email can login", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.register(email, pass);

    // expect un-confirmed emails cannot login
    await login(client, email, pass, confirmEmailError);

    await User.update({
      email: email
    }, {confirmed: true});

    // expect invalid password cannot login
    await login(client, email, "bad_password112233", invalidLoginInfo);

    const response = await client.login(email, pass);

    // expect registerd & confirmed & valid email & valid password can login
    expect(response.data).toEqual({login: null});
  });
});
