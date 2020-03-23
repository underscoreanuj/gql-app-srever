export const REGISTER_MUTATION = (e : string, p : string) => `
mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
}
`;

export const LOGIN_MUTATION = (e : string, p : string) => `
mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
}
`;

export const MIDDLEWARE_QUERY = `
{
    middleware {
        id
        email
    }
}`;

export const LOGOUT_MUTATION = `
mutation {
  logout
}
`;
