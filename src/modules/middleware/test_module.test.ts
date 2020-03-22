import axios from "axios";
import {Connection} from "typeorm";
import {createTypeORMConn} from "../../utils/CreateTypeORMConn";
import {User} from "../../entity/User";
import request from "graphql-request";

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
  //   it("cannot get user if not logged-in", async () => {
  //      pass
  //   });

  it("get current user", async () => {
    const tt = await axios.post(process.env.TEST_HOST as string, {
      query: loginMutation(email, pass)
    }, {withCredentials: true});

    console.log(tt.data.data);

    const res = await request(process.env.TEST_HOST as string, test_query);

    console.log(res);
    console.log(userId);

    const response = await axios.post(process.env.TEST_HOST as string, {
      query: test_query
    }, {withCredentials: true});

    console.log(response.data.data);
    // console.log(userId);
    // expect(response.data.data).toEqual({
    //   midd: {
    //     id: userId,
    //     email: email
    //   }
    // });
  });
});
