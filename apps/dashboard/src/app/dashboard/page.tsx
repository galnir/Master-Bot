import Link from 'next/link';
import GuildsList from './guilds';

export default function DashboardIndexPage() {
	return (
		<div className="bg-slate-900 h-screen">
			<header className="py-4 px-5">
				<Link href="/">
					<h3 className="text-white hover:underline">Go back</h3>
				</Link>
			</header>
			<main className="flex items-center justify-center">
				<h1 className="text-white text-5xl font-semibold">Select a guild</h1>
				<GuildsList />
			</main>
		</div>
	);
}
