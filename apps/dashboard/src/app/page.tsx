import HeaderButtons from '~/components/header-buttons';
import Logo from '~/components/logo';

export default function HomePage() {
	return (
		<div>
			<header className="p-40 py-10 flex justify-between">
				<div>
					<Logo />
				</div>
				<HeaderButtons />
			</header>
			<main></main>
		</div>
	);
}
