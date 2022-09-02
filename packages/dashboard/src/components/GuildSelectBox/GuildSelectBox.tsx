import Link from "next/link";
import { env } from "../../env/client.mjs";

interface GuildSelectBoxProps {
  img: string;
  name: string;
  isBotIn: boolean;
  id: string;
}

const allowInvite =
  env.NEXT_PUBLIC_ALLOW_NEW_GUILDS.toLowerCase() == "true" ? true : false;

const GuildSelectBox = ({ img, name, isBotIn, id }: GuildSelectBoxProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <h1
          className={
            "rounded-t-md text-center shadow-inner shadow-slate-900" +
            (isBotIn ? " bg-green-700" : " bg-gray-500")
          }
        >
          {name}
        </h1>
        <img
          className={
            "rounded-b-md w-52 mx-auto d-block " +
            (isBotIn ? "grayscale-0" : "grayscale")
          }
          src={img}
          alt="guild banner"
        />
      </div>
      <div className="text-white flex justify-center">
        {isBotIn ? (
          <Link href={`/dashboard/${id}`}>
            <button className="px-7 py-3 bg-blue-900 rounded-md hover:bg-blue-700 shadow shadow-slate-900">
              {"Manage"}
            </button>
          </Link>
        ) : allowInvite ? (
          <a
            className="px-7 py-3 bg-blue-900 rounded-md hover:bg-blue-700 shadow shadow-slate-900 "
            href={env.NEXT_PUBLIC_INVITE_URL}
            target="_blank"
            rel="noreferrer"
          >
            {"Invite"}
          </a>
        ) : (
          <button
            className="px-7 py-3 bg-blue-900 rounded-md hover:bg-blue-700 shadow shadow-slate-700 opacity-50 cursor-not-allowed"
            disabled
            title="Currently Not Accepting New Invites"
          >
            {"Invite Disabled"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GuildSelectBox;
