import type { LoaderFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { authenticator } from "~/server/auth.server";

interface SocialButtonProps {
  provider: string;
  label: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, label }) => (
  <Form action={`/auth/${provider}`} method="post">
    <button>{label}</button>
  </Form>
);

export const loader: LoaderFunction = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });
};

export default function Login() {
  return (
    <>
      <SocialButton provider="discord" label="Login with Discord" />
    </>
  );
}
