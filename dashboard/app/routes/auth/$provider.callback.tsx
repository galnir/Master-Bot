import type { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/server/auth.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  if (!params.provider) return;
  return await authenticator.authenticate("discord", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
