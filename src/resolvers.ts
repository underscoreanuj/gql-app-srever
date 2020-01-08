import {ResolverMap} from "./types/gql-utils";
import * as bcrypt from "bcryptjs";
import {User} from "./entity/User";

export const resolvers: ResolverMap = {
  Query: {
    hello: (_, {name} : GQL.IHelloOnQueryArguments) => `Hello ${name || "World"}`
  },
  Mutation: {
    register: async (_, {email, password} : GQL.IRegisterOnMutationArguments) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const new_user = User.create({email, password: hashedPassword});

      await new_user.save();

      return true;
    }
  }
};
