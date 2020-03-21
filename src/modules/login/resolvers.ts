import * as bcrypt from "bcryptjs";
import {ResolverMap} from "../../types/gql-utils";
import {User} from "../../entity/User";
import {invalidLoginInfo, confirmEmailError} from "./errorMessages";

const errorResponse = [
  {
    path: "email",
    message: invalidLoginInfo
  }
];

export const resolvers: ResolverMap = {
  Query: {
    bye_login: () => "bye_login"
  },
  Mutation: {
    login: async (_, args : GQL.ILoginOnMutationArguments) => {
      const {email, password} = args;

      const user = await User.findOne({
        where: {
          email: email
        }
      });

      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: confirmEmailError
          }
        ];
      }

      const valid_pass = await bcrypt.compare(password, user.password);

      if (!valid_pass) {
        return errorResponse;
      }

      return null;
    }
  }
};
