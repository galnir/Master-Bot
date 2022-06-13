import { Link } from "@remix-run/react";
import HeaderButton from "~/components/HeaderButton";
import Logo from "~/components/Logo";

export default function Index() {
  return (
    <div>
      <header className="p-40 py-10 flex justify-between">
        <div>
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="flex justify-between gap-5">
          <HeaderButton text="Code" linkTo="/" newWindow={true} />
          <HeaderButton text="Dashboard" linkTo="/dashboard" />
        </div>
      </header>
    </div>
  );
}
