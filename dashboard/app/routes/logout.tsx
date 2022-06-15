import type { ActionFunction } from "@remix-run/node";
import { authenticator } from "~/server/auth.server";

export let action: ActionFunction = async ({ request, params }) => {
  await authenticator.logout(request, { redirectTo: "/" });
};
