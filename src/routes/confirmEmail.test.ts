import {INVALID_CONFIRMATION} from "../messages";
import fetch from "node-fetch";

describe("Link confirmation route check:", () => {
  it("sends invalid link message if bad ID is sent", async () => {
    const response = await fetch(`${process.env.TEST_HOST}/confirm/${Math.floor(Math.random() * 5)}`);
    const text = await response.text();

    expect(text).toEqual(INVALID_CONFIRMATION);
  });
});
