import * as Redis from "ioredis";
import fetch from "node-fetch";

import {createConfirmEmailLink} from "./createConfirmEmailLink";
import {createTypeORMConn} from "./CreateTypeORMConn";
import {User} from "../entity/User";
import {EMAIL_CONFIRMED} from "../messages";

let userId = "";
let redis = new Redis();

beforeAll(async () => {
  await createTypeORMConn();
  const user = await User.create({email: "testemail@gmail.com", password: "123!@#test__pasword"}).save();
  userId = user.id;
});

describe("Confirmation Link tests:", () => {
  it("checks user is confirmed and key is removed post-confirmation", async () => {
    const url = await createConfirmEmailLink(process.env.TEST_HOST as string, userId as string, new Redis());

    const response = await fetch(url);
    const text = await response.text();
    console.log(text);

    expect(text).toEqual(EMAIL_CONFIRMED);

    const user = await User.findOne({
      where: {
        id: userId
      }
    });
    expect((user as User).confirmed).toBeTruthy();
    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
  });
});
