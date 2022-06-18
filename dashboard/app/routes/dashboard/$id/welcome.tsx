import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import ValidationMessage from "~/components/ValidationMessage";

type LoaderData = {
  welcome_message: string | null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  const response = await fetch("http://localhost:1212/guild?id=" + id);

  if (response.status !== 200) {
    return json({ error: "Something went wrong!" });
  }

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

  const values = Object.fromEntries(formData);
  if (response.status !== 200) {
    return json({ error: "Something went wrong!", values });
  }

  return null;
};

export default function WelcomeScreen() {
  const { welcome_message } = useLoaderData<LoaderData>();
  const transition = useTransition();
  const actionData = useActionData();

  return (
    <div className="p-10 w-fit">
      <h1 className="text-white text-3xl">Welcome Message Settings</h1>
      <h3 className="my-10">Welcome new users with a custom message:</h3>
      <Form method="post" action=".">
        <fieldset disabled={transition.state === "submitting"}>
          {actionData?.error ? (
            <ValidationMessage
              isSubmitting={transition.state === "submitting"}
              error={actionData?.error}
            />
          ) : null}
          <p>
            <label>
              Welcome Message:
              <br />
              <textarea
                name="welcome_message"
                placeholder={welcome_message ?? ""}
                defaultValue={actionData?.values.welcome_message}
                className="block -ml-1 w-full bg-black outline-none overflow-auto my-2 resize-none p-4 text-white rounded-lg border border-gray-800 focus:ring-blue-600 focus:border-blue-600"
              />
            </label>
          </p>
          <p className="relative">
            <button
              type="submit"
              className="bg-blue-600 p-4 rounded-lg text-white absolute top-3 right-2 hover:bg-blue-700"
            >
              {transition.state === "submitting" ? "Saving..." : "Save"}
            </button>
          </p>
        </fieldset>
      </Form>
    </div>
  );
}
