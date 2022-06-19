import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

import tailwindUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindUrl },
];

export const meta: MetaFunction = () => {
  const description = `Master Bot Dashboard`;
  return {
    charset: "utf-8",
    description,
    keywords: "master-bot, dashboard",
  };
};

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-900">
        {children}
        <Outlet />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document title={"Master Bot Dashboard"}>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div>
        <h1>
          ${caught.status} ${caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document title="Uh-oh!">
      <div>
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
