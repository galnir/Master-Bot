import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '~/styles/globals.css';

import { TRPCReactProvider } from './providers';
import { headers } from 'next/headers';
import { ThemeProvider } from '~/components/theme-provider';

const fontSans = Inter({
	subsets: ['latin'],
	variable: '--font-sans'
});

export const metadata: Metadata = {
	title: 'Master Bot Dashboard',
	description: 'Master bot monorepo with shared backend for web & bot apps'
};

export default function Layout(props: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
				className={[
					'font-sans dark:bg-slate-900 bg-white h-screen',
					fontSans.variable
				].join(' ')}
			>
				<TRPCReactProvider headers={headers()}>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						{props.children}
					</ThemeProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
