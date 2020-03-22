import * as yup from "yup";

import {User} from "../../entity/User";
import {ResolverMap} from "../../types/gql-utils";
import {createConfirmEmailLink} from "../../utils/createConfirmEmailLink";
import {formatYupError} from "../../utils/formatYupError";
import {sendEmail} from "../../utils/sendEmail";
import {duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough} from "./errorMessages";

const schema = yup.object().shape({
  email: yup.string().min(7, emailNotLongEnough).max(255).email(invalidEmail),
  password: yup.string().min(6, passwordNotLongEnough).max(255)
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (_, args : GQL.IRegisterOnMutationArguments, {redis, url}) => {
      try {
        await schema.validate(args, {abortEarly: false});
      } catch (err) {
        return formatYupError(err);
      }
      const {email, password} = args;
      const userAlreadyExists = await User.findOne({
        where: {
          email: email
        },
        select: ["id"]
      });

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }

      // const hashedPassword = await bcrypt.hash(password, 10);
      // const new_user = User.create({email: email, password: hashedPassword});
      const new_user = User.create({email: email, password: password});

      await new_user.save();

      if (process.env.NODE_ENV !== "test") {
        await sendEmail(email, await createConfirmEmailLink(url, new_user.id, redis));
      } else {
        await createConfirmEmailLink(url, new_user.id, redis);
      }

      return null;
    }
  }
};
