import "reflect-metadata";
import {GraphQLServer} from "graphql-yoga";
import {importSchema} from "graphql-import";
import {resolvers} from "./resolvers";
import * as path from "path";
import {createTypeORMConn} from "./utils/CreateTypeORMConn";

export const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname, "./schema.graphql"));

  const server = new GraphQLServer({typeDefs, resolvers});

  await createTypeORMConn();
  await server.start();
  console.log("Server is running on localhost:4000");
};

startServer();
