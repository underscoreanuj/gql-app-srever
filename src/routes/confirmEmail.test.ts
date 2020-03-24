import fetch from "node-fetch";

import {INVALID_CONFIRMATION} from "../messages";

describe("Link confirmation route check:", () => {
  it("sends invalid link message if bad ID is sent", async () => {
    // try confirming email for invalid key
    const response = await fetch(`${process.env.TEST_HOST}/confirm/${ 123456}`);
    const text = await response.text();

    expect(text).toEqual(INVALID_CONFIRMATION);
  });
});
