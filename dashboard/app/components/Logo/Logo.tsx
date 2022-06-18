import { Link } from "@remix-run/react";

const Logo = () => {
  return (
    <Link to=".">
      <h1 className="font-bold text-transparent w-max text-6xl bg-clip-text bg-gradient-to-r from-red-600 to-amber-500">
        <span>Master Bot</span>
      </h1>
    </Link>
  );
};

export default Logo;
