import { auth } from '@master-bot/auth';
import { Button } from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '~/components/ui/dropdown';
import Image from 'next/image';
import Link from 'next/link';
import { Server } from 'lucide-react';
import { SignIn, SignOut } from '~/components/auth';
import { ModeToggle } from '~/components/theme-toggle';

export default async function HeaderButtons() {
	const session = await auth();

	return (
		<div className="flex items-center justify-between gap-5">
			<a
				href="https://github.com/galnir/Master-Bot"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Button>Code on Github</Button>
			</a>

			{session ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex items-center gap-3 hover:cursor-pointer">
							<Image
								src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.image}.webp?size=512`}
								className="h-8 w-8 rounded-full"
								width={32}
								height={32}
								alt="user avatar"
							/>
							<h1 className="dark:text-white text-black">
								{session.user.name}
							</h1>
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" sideOffset={12}>
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<Link
									href="/dashboard"
									className="w-full h-full flex items-center"
								>
									<Server />
									<span className="ml-2">My Servers</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator className="bg-gray-400" />
							<DropdownMenuItem>
								<div className="w-56">
									<SignOut className="w-full text-left">Sign out</SignOut>
								</div>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<SignIn
					provider="discord"
					className="rounded-full bg-blue-600 px-10 py-3 font-semibold text-white no-underline transition hover:bg-blue-700"
				>
					Sign in with Discord
				</SignIn>
			)}
			<ModeToggle />
		</div>
	);
}
