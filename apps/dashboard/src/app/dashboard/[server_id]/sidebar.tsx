import Link from 'next/link';
import { MessageCircle, ChevronRightSquare } from 'lucide-react';
import Logo from '~/components/logo';

const links = [
	{
		href: 'commands',
		label: 'Commands',
		icon: ChevronRightSquare
	},
	{
		href: 'welcome-message',
		label: 'Welcome Message',
		icon: MessageCircle
	}
];

export default function Sidebar({ server_id }: { server_id: string }) {
	return (
		<aside className="flex flex-col items-center gap-10">
			<Link href={`/dashboard/${server_id}`}>
				<Logo size="medium" />
			</Link>
			<div className="flex flex-col gap-6">
				{links.map(link => (
					<Link
						key={link.href}
						className="flex gap-4"
						href={`/dashboard/${server_id}/${link.href}`}
					>
						<link.icon size={24} />
						<p className="text-xl">{link.label}</p>
					</Link>
				))}
			</div>
		</aside>
	);
}
