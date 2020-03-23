import * as bcrypt from "bcryptjs";

import {User} from "../../entity/User";
import {ResolverMap} from "../../types/gql-utils";
import {confirmEmailError, invalidLoginInfo} from "./errorMessages";

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
    login: async (_, args : GQL.ILoginOnMutationArguments, {session}) => {
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

      // successfull login
      session.userId = user.id;

      return null;
    }
  }
};
