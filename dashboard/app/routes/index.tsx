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
          <HeaderButton
            linkTo="https://github.com/galnir/Master-Bot"
            external={true}
            newWindow={true}
          >
            Code
          </HeaderButton>
          <HeaderButton linkTo="/dashboard">Dashboard</HeaderButton>
        </div>
      </header>
    </div>
  );
}
