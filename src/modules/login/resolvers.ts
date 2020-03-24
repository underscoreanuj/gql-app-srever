import * as bcrypt from "bcryptjs";

import {USER_SESSION_ID_PREFIX} from "../../constants";
import {User} from "../../entity/User";
import {ResolverMap} from "../../types/gql-utils";
import {confirmEmailError, forgotPasswordAccountLockedError, invalidLoginInfo} from "./errorMessages";

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
    login: async (_, args : GQL.ILoginOnMutationArguments, {redis, session, req}) => {
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

      if (user.forgotPasswordLocked) {
        return [
          {
            path: "email",
            message: forgotPasswordAccountLockedError
          }
        ];
      }

      const valid_pass = await bcrypt.compare(password, user.password);

      if (!valid_pass) {
        return errorResponse;
      }

      // successfull login
      session.userId = user.id;

      if (req.sessionID) {
        // creates an array if key is not present else pushes data to existing key
        await redis.lpush(`${USER_SESSION_ID_PREFIX}${user.id}`, req.sessionID);
      }

      return null;
    }
  }
};
