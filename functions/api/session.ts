export const onRequestGet: PagesFunction<Env, any, Data> = async ({ data }) => {
  return new Response(JSON.stringify(data.currentUser));
};
