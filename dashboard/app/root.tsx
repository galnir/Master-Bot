import { Links, LiveReload, Meta, Outlet } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import tailwindUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindUrl },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Master Bot Dashboard</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}
