import {request} from "graphql-request";
import {User} from "../../entity/User";
import {startServer} from "../../startServer";
import {AddressInfo} from "net";

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const {port} = app.address()as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

const email = "test@testing.com";
const pass = "testing_password";

const mutation = `
mutation {
    register(email: "${email}", password: "${pass}") {
      path
      message
    }
}
`;

test("Register user", async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({register: null});
  const users = await User.find({where: {
      email
    }});
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(pass);

  const another_response: any = await request(getHost(), mutation);
  expect(another_response.register).toHaveLength(1);
  expect(another_response.register[0].path).toEqual("email");
});
