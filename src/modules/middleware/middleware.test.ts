import axios from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import * as tough from "tough-cookie";
import {Connection} from "typeorm";

import {User} from "../../entity/User";
import {createTypeORMConn} from "../../utils/CreateTypeORMConn";

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

let conn: Connection;
let userId: String;
const email = "middlewaretest@gmail.com";
const pass = "test_pass_123123";

const loginMutation = (e : string, p : string) => `
mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
}
`;

const test_query = `
{
    middleware {
        id
        email
    }
}`;

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
    console.log("without axios cookie jar");

    const response = await axios.post(process.env.TEST_HOST as string, {query: test_query});
    expect(response.data.data.middleware).toBeNull();
  });

  it("get current user", async () => {
    await axios.post(process.env.TEST_HOST as string, {
      query: loginMutation(email, pass)
    }, {
      jar: cookieJar,
      withCredentials: true
    });

    const response = await axios.post(process.env.TEST_HOST as string, {
      query: test_query
    }, {
      jar: cookieJar,
      withCredentials: true
    });

    expect(response.data.data).toEqual({
      middleware: {
        id: userId,
        email: email
      }
    });
  });
});
