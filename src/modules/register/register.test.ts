import {request} from "graphql-request";
import {User} from "../../entity/User";
import {startServer} from "../../startServer";
import {AddressInfo} from "net";
import {duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough} from "./errorMessages";

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const {port} = app.address()as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

const email = "test@gmail.com";
const pass = "testing_password";

const mutation = (e : string, p : string) => `
mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
}
`;

test("Register user", async () => {
  // ensure adding a new user is successfull
  const response = await request(getHost(), mutation(email, pass));
  expect(response).toEqual({register: null});
  const users = await User.find({where: {
      email
    }});
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(pass);

  // ensure adding the same email gives a email already exists error
  const another_response: any = await request(getHost(), mutation(email, pass));
  expect(another_response.register).toHaveLength(1);
  expect(another_response.register[0]).toEqual({path: "email", message: duplicateEmail});

  // ensure invalid email is caught
  const yup_invalid_email_response: any = await request(getHost(), mutation("test", pass));
  expect(yup_invalid_email_response).toEqual({
    register: [
      {
        path: "email",
        message: emailNotLongEnough
      }, {
        path: "email",
        message: invalidEmail
      }
    ]
  });

  // ensure invalid password is caught
  const yup_bad_pass_response: any = await request(getHost(), mutation(email, "pass"));
  expect(yup_bad_pass_response).toEqual({
    register: [
      {
        path: "password",
        message: passwordNotLongEnough
      }
    ]
  });

  // ensure invalid password and email is caught
  const yup_bad_pass_and_email_response: any = await request(getHost(), mutation("test", "pass"));
  expect(yup_bad_pass_and_email_response).toEqual({
    register: [
      {
        path: "email",
        message: emailNotLongEnough
      }, {
        path: "email",
        message: invalidEmail
      }, {
        path: "password",
        message: passwordNotLongEnough
      }
    ]
  });
});
