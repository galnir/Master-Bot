import type { LoaderFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { SocialsProvider } from "remix-auth-socials";
import { authenticator } from "~/server/auth.server";

interface SocialButtonProps {
  provider: SocialsProvider;
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
      <SocialButton
        provider={SocialsProvider.DISCORD}
        label="Login with Discord"
      />
    </>
  );
}
