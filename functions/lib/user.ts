export interface User {
  userId: number;
  name: string;
  providers: Record<string, Record<string, object | string | number>>;
}

export const UserManager = (env: Env) => ({
  getOrCreateUser: async (user: User) => {
    await env.EB.put(`user:${user.userId}`, JSON.stringify(user));
    return user;
  }
});
