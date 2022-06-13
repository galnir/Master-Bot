import { Link } from "@remix-run/react";

interface HeaderButtonProps {
  text: string;
  linkTo: string;
  newWindow?: boolean;
}

const HeaderButton = ({ text, linkTo, newWindow }: HeaderButtonProps) => {
  return (
    <div>
      <Link to={linkTo} target={newWindow ? "_blank" : ""}>
        <p className="p-3 text-white bg-purple-600 rounded font-light hover:bg-purple-500">
          {text}
        </p>
      </Link>
    </div>
  );
};

export default HeaderButton;
