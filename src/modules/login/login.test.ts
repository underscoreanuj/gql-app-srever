import {request} from "graphql-request";
import {Connection} from "typeorm";

import {User} from "../../entity/User";
import {createTypeORMConn} from "../../utils/CreateTypeORMConn";
import {confirmEmailError, invalidLoginInfo} from "./errorMessages";

const email = "logintest009@gmail.com";
const pass = "testing_password";

const registerMutation = (e : string, p : string) => `
mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
}
`;

const loginMutation = (e : string, p : string) => `
mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
}
`;

let conn: Connection;
beforeAll(async () => {
  conn = await createTypeORMConn();
});

afterAll(async () => {
  conn.close();
});

const login = async (e : string, p : string, errMsg : string) => {
  const response = await request(process.env.TEST_HOST as string, loginMutation(e, p));
  expect(response).toEqual({
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
    await login("unregisteredemail@gmail.com", "unregistered_pass", invalidLoginInfo);
  });

  it("checks unconfirmed emails/bad password cannot login & valid & confirmed email can login", async () => {
    await request(process.env.TEST_HOST as string, registerMutation(email, pass));
    await login(email, pass, confirmEmailError);
    await User.update({
      email: email
    }, {confirmed: true});
    await login(email, "bad_password112233", invalidLoginInfo);
    const response = await request(process.env.TEST_HOST as string, loginMutation(email, pass));
    expect(response).toEqual({login: null});
  });
});
