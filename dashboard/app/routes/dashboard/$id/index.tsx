import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/server/auth.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return null;
};

export default function DashboardScreenIndex() {
  return (
    <div>
      <h1>In dashboard screen index</h1>
    </div>
  );
}
