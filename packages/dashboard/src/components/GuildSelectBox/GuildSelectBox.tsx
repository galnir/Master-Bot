import Link from "next/link";

interface GuildSelectBoxProps {
  img: string;
  name: string;
  isBotIn: boolean;
  id: string;
  invite_url: string;
}

const GuildSelectBox = ({
  img,
  name,
  isBotIn,
  id,
  invite_url,
}: GuildSelectBoxProps) => {
  console.log("dsadsadasdsadsais", invite_url);
  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <img className="rounded-2xl w-52" src={img} alt="guild banner" />
      </div>
      <div className="text-white flex justify-between">
        <h1>{name}</h1>
        {isBotIn ? (
          <Link href={`/dashboard/${id}`}>
            <button className="px-7 py-3 bg-blue-900 rounded-md hover:bg-blue-700">
              {isBotIn ? "Go" : "Invite"}
            </button>
          </Link>
        ) : (
          <a
            className="px-7 py-3 bg-blue-900 rounded-md hover:bg-blue-700"
            href={invite_url}
            target="_blank"
            rel="noreferrer"
          >
            Invite
          </a>
        )}
      </div>
    </div>
  );
};

export default GuildSelectBox;
