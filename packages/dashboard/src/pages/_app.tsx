import '../styles/globals.css';
import { trpc } from '../utils/trpc';
import { SessionProvider } from 'next-auth/react';
import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? (page => page);

  return (
    <SessionProvider session={pageProps.session}>
      <div className="bg-slate-800 h-screen">
        <ToastContainer theme={'dark'} toastClassName="p-4" />
        {getLayout(<Component {...pageProps} />)}
      </div>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
