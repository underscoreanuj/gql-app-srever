import * as rp from "request-promise";

import {LOGIN_MUTATION, LOGOUT_MUTATION, MIDDLEWARE_QUERY, REGISTER_MUTATION} from "./Queries";

export class TestClient {
  url: string;
  options: {
    json: boolean;
    withCredentials: boolean;
    jar: any;
  };

  constructor(url : string) {
    this.url = url;
    this.options = {
      json: true,
      withCredentials: true,
      jar: rp.jar()
    };
  }

  async register(email : string, password : string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: REGISTER_MUTATION(email, password)
      }
    });
  }

  async login(email : string, password : string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: LOGIN_MUTATION(email, password)
      }
    });
  }

  async middleware() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: MIDDLEWARE_QUERY
      }
    });
  }

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: LOGOUT_MUTATION
      }
    });
  }
}
