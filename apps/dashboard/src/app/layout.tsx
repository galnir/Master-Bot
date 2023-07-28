import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '~/styles/globals.css';

import { TRPCReactProvider } from './providers';

const fontSans = Inter({
	subsets: ['latin'],
	variable: '--font-sans'
});

export const metadata: Metadata = {
	title: 'Master Bot Dashboard',
	description: 'Master bot monorepo with shared backend for web & bot apps',
	openGraph: {
		title: 'Master Bot Dashboard',
		description: 'Master bot monorepo with shared backend for web & bot apps',
		// url: 'https://create-t3-turbo.vercel.app',
		siteName: 'Master Bot Dashboard'
	}
};

export default function Layout(props: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={['font-sans', fontSans.variable].join(' ')}>
				<TRPCReactProvider>{props.children}</TRPCReactProvider>
			</body>
		</html>
	);
}
