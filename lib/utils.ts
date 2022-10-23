import { z } from 'zod';

export const toInt = <T>(x: string | null, def: T): number | T => {
  if (x === null) return def;
  const r = parseInt(x);
  if (isNaN(r)) return def;
  return r;
};

export const getFormInt = (f: FormData, key: string): number | null => {
  const v = f.get(key);
  if (typeof v !== 'string') return null;
  return toInt(v, null);
};

export type NonEmptyArray<A> = [A, ...A[]];

export const valueOrFirst = <A>(v: A | NonEmptyArray<A>): A => (Array.isArray(v) ? v[0] : v);

export const delay = async (duration: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

export const fetchJson = async <S extends z.ZodType>(
  url: string,
  init: RequestInit | undefined,
  schema: S,
  reqCause: Request | undefined
): Promise<z.infer<S>> => {
  const cookie = reqCause?.headers.get('cookie');
  const opts = {
    ...(init ?? {}),
    ...(typeof cookie === 'string' ? { headers: { cookie } } : {})
  };
  var resp = await fetch(url, opts);
  var json = await resp.json();
  return schema.parse(json);
};
