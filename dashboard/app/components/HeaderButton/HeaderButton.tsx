import { Link } from "@remix-run/react";
import React from "react";

interface HeaderButtonProps {
  children: React.ReactNode;
  linkTo: string;
  newWindow?: boolean;
  external?: boolean;
}

const HeaderButton = ({
  children,
  linkTo,
  newWindow,
  external,
}: HeaderButtonProps) => {
  const paragraph = (
    <p className="p-3 text-white bg-purple-600 rounded font-light hover:bg-purple-500">
      {children}
    </p>
  );
  return (
    <div>
      {external ? (
        <a href={linkTo} target={newWindow ? "_blank" : ""} rel="noreferrer">
          {paragraph}
        </a>
      ) : (
        <Link to={linkTo} target={newWindow ? "_blank" : ""}>
          {paragraph}
        </Link>
      )}
    </div>
  );
};

export default HeaderButton;
