import type { MetaFunction } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./styles/app.css"
import { z } from 'zod';
import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import * as Model from '~lib/model';
import { fetchJson } from '~lib/utils';


const loaderDataSchema = z.nullable(Model.tokenPayloadSchema);
export type LoaderData = z.infer<typeof loaderDataSchema>;

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData | Response | null> => {
  const url = new URL(request.url);
  const currentUser = await fetchJson(`${url.origin}/api/session`, undefined, loaderDataSchema, request);

  if (currentUser === null){
    if (url.pathname !== "/login")
      return redirect("/login");
    return null;
  }
  if (!currentUser.allow) {
    if (url.pathname !== "/unauthorized")
    return redirect("/unauthorized");
    return null;
  }
  if (url.pathname === "/" || url.pathname === "/login" || url.pathname === "/unauthorized")
    return redirect("/ledgers");

  return currentUser;
};

export function links() {
  return [{ rel: "stylesheet", href: styles }]
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Empire Builder",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
