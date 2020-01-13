import {request} from "graphql-request";
import {host} from "./constants";
import {User} from "../entity/User";
import {createTypeORMConn} from "../utils/CreateTypeORMConn";

beforeAll(async () => {
  await createTypeORMConn();
});

const email = "test@testing.com";
const pass = "testing_password";

const mutation = `
mutation {
    register(email: "${email}", password: "${pass}")
}
`;

test("Register user", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({register: true});
  const users = await User.find({where: {
      email
    }});
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(pass);
});
