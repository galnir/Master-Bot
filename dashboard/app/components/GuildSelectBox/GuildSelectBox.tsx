interface GuildSelectBoxProps {
  img: string;
  name: string;
  isBotIn: boolean;
}

const GuildSelectBox = ({ img, name, isBotIn }: GuildSelectBoxProps) => {
  return (
    <div>
      <div>
        <div className="max-w-xs">
          <img src={img} alt="guild banner" />
        </div>
        <div className="text-white">
          <h1>{name}</h1>
          <h2>{isBotIn ? "Go" : "Invite Bot"}</h2>
        </div>
      </div>
    </div>
  );
};

export default GuildSelectBox;
