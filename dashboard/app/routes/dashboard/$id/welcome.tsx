import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

type LoaderData = {
  welcome_message: string | null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  const response = await fetch("http://localhost:1212/guild?id=" + id);
  const guild = await response.json();
  const welcome_message = guild.welcomeMessage;

  return json({ welcome_message });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  const formData = await request.formData();

  const welcomeMessage = formData.get("welcome_message");

  const response = await fetch("http://localhost:1212/guild?id=" + id, {
    method: "PATCH",
    body: JSON.stringify({ welcomeMessage }),
  });

  if (response.status !== 200) {
    const values = Object.fromEntries(formData);
    return json({ error: "Something went wrong!", values });
  }

  return null;
};

export default function WelcomeScreen() {
  const { welcome_message } = useLoaderData<LoaderData>();
  const actionData = useActionData();
  return (
    <div className="p-10">
      <h1 className="text-white text-3xl">Welcome Message Settings</h1>
      <h3 className="my-10">Welcome new users with a custom message:</h3>
      <Form method="post" action=".">
        <p>
          <label>
            Welcome Message:
            <br />
            <textarea
              name="welcome_message"
              placeholder={welcome_message ?? ""}
              defaultValue={actionData?.values.welcome_message}
            />
          </label>
        </p>
        <p>
          <button type="submit">Save</button>
        </p>
      </Form>
    </div>
  );
}
