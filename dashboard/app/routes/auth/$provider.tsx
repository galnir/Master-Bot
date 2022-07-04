import {
  type ActionFunction,
  type LoaderFunction,
  redirect,
} from "@remix-run/node";
import { authenticator } from "~/server/auth.server";

export let loader: LoaderFunction = () => redirect("/login");

export let action: ActionFunction = async ({ request, params }) => {
  if (!params.provider) return;
  return await authenticator.authenticate(params.provider, request);
};
