import Link from 'next/link';
import { env } from '../../env/client.mjs';

interface GuildSelectBoxProps {
  img: string;
  name: string;
  isBotIn: boolean;
  id: string;
}

const GuildSelectBox = ({ img, name, isBotIn, id }: GuildSelectBoxProps) => {
  return (
    <div className="flex flex-col gap-4 border-4 p-4 border-slate-800 rounded-2xl">
      <div className="max-w-xs">
        <img className="rounded-xl w-52" src={img} alt="guild banner" />
      </div>
      <div className="text-white flex justify-between">
        <h1>{name}</h1>
        {isBotIn ? (
          <Link href={`/dashboard/${id}`}>
            <button className="px-7 py-3 bg-blue-900 rounded-md hover:bg-blue-700">
              {isBotIn ? 'Go' : 'Invite'}
            </button>
          </Link>
        ) : (
          <a
            className="px-6 py-3 bg-blue-900 rounded-md hover:bg-blue-700"
            href={env.NEXT_PUBLIC_INVITE_URL}
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
