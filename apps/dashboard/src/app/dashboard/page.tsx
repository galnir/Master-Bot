import Link from 'next/link';
import GuildsList from './guilds';
import { auth } from '@master-bot/auth';
import { redirect } from 'next/navigation';

export default async function DashboardIndexPage() {
	const session = await auth();

	if (!session) {
		redirect('/');
	}

	return (
		<div className="bg-slate-900 h-screen">
			<header className="py-4 px-5">
				<Link href="/">
					<h3 className="text-white hover:underline">Go back</h3>
				</Link>
			</header>
			<main className="flex flex-col items-center justify-center mx-80">
				<h1 className="text-white text-5xl font-semibold mb-10">
					Select a guild
				</h1>
				<GuildsList />
			</main>
		</div>
	);
}
