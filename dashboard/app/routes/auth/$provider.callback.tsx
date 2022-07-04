import { type LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/server/auth.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  if (!params.provider) return;

  const url = new URL(request.url);
  const error = url.searchParams.get("error");

  if (error) {
    return redirect("/");
  }

  return await authenticator.authenticate("discord", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
