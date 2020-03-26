import * as fs from 'fs';
// import * as glob from 'glob';
import { GraphQLSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import * as path from 'path';


export const genSchema = () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, '../modules'));

  // const pathToModules = path.join(__dirname, '../modules');
  // const graphqlTypes = glob
  //   .sync(`${pathToModules}/**/*.graphql`)
  //   .map(x => fs.readFileSync(x, { encoding: 'utf-8' }));

  // const resolversT = glob
  //   .sync(`${pathToModules}/**/*.ts`)
  //   .map(r => require(r).resolvers);

  // console.log(graphqlTypes);
  // console.log(resolversT);

  folders.forEach(folder => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const typeDefs = importSchema(path.join(__dirname, `../modules/${folder}/schema.graphql`));

    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  return mergeSchemas({ schemas });
};
