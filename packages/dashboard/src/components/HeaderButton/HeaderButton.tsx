import Link from 'next/link';
import React from 'react';

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
  external
}: HeaderButtonProps) => {
  const linkStyles =
    'p-3 text-white bg-pink-600 rounded font-light hover:bg-pink-500';
  return (
    <div>
      {external ? (
        <a
          href={linkTo}
          className={linkStyles}
          target={newWindow ? '_blank' : ''}
          rel="noreferrer"
        >
          {children}
        </a>
      ) : (
        <Link href={linkTo} target={newWindow ? '_blank' : ''}>
          <span className={linkStyles}>{children}</span>
        </Link>
      )}
    </div>
  );
};

export default HeaderButton;
