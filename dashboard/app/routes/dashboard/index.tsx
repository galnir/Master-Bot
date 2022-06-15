import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/server/auth.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return json({ user });
};

export default function DashboardIndex() {
  const { user } = useLoaderData();
  console.log("user", user);
  return (
    <div>
      <h1>Hi</h1>
    </div>
  );
}
