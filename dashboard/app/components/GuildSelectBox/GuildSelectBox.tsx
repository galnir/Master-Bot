interface GuildSelectBoxProps {
  img: string;
  name: string;
  isBotIn: boolean;
}

const GuildSelectBox = ({ img, name, isBotIn }: GuildSelectBoxProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <img className="rounded-2xl w-52" src={img} alt="guild banner" />
      </div>
      <div className="text-white flex justify-between">
        <h1>{name}</h1>
        <button className="px-7 py-3 bg-blue-900 rounded-md hover:bg-blue-700">
          {isBotIn ? "Go" : "Invite"}
        </button>
      </div>
    </div>
  );
};

export default GuildSelectBox;
