import Link from "next/link";

const Logo = () => {
  return (
    <Link href="." passHref>
      <a className="block font-bold text-transparent w-max text-6xl bg-clip-text bg-gradient-to-r from-red-600 to-amber-500">
        Master Bot
      </a>
    </Link>
  );
};

export default Logo;
