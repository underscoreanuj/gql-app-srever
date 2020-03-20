import * as bcrypt from "bcryptjs";
import {ResolverMap} from "../../types/gql-utils";
import {User} from "../../entity/User";
import * as yup from "yup";
import {formatYupError} from "../../utils/formatYupError";
import {duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough} from "./errorMessages";
import {createConfirmEmailLink} from "../../utils/createConfirmEmailLink";

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
      const userAlreadyExists = await User.findOne({where: {
          email
        }, select: ["id"]});

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const new_user = User.create({email, password: hashedPassword});

      await new_user.save();

      await createConfirmEmailLink(url, new_user.id, redis);

      return null;
    }
  }
};
