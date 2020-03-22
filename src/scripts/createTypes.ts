import {generateNamespace} from "@gql2ts/from-schema";
import {genSchema} from "../utils/genSchema";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const myNamespace = generateNamespace("GQL", genSchema());
fs.writeFile(path.join(__dirname, "../types/schema.d.ts"), myNamespace, error => {
  console.log(error);
});
