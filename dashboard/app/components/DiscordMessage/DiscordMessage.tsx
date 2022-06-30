const DiscordMessage = ({ text, avatar }: { text: string; avatar: string }) => {
  const today = new Date(Date.now());
  return (
    <div className="p-3 rounded-md flex bg-[#2c2f33] text-white] gap-4 w-96 h-fit">
      <img
        src={"../../generic-image.png"}
        alt="bot avatar"
        className="block  rounded-full h-10 w-10"
      />
      <div className="flex flex-col flex-grow">
        <div className="flex w-fit gap-2 items-center">
          <h4 className="text-blue-300">Master Bot</h4>
          <p className="px-1 text-white bg-[#6577e6] rounded-sm text-xs">BOT</p>
          <p className="text-[#99aab5] text-xs">{today.toLocaleDateString()}</p>
        </div>
        <p className="block text-white whitespace-normal max-w-full">{text}</p>
      </div>
    </div>
  );
};

export default DiscordMessage;
