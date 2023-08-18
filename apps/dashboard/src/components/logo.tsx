export default function Logo({
	size = 'large'
}: {
	size?: 'small' | 'medium' | 'large';
}) {
	return (
		<div
			className={`font-bold text-transparent w-max bg-clip-text bg-gradient-to-r from-red-600 to-amber-500 ${
				size === 'small'
					? 'text-3xl'
					: size === 'medium'
					? 'text-4xl'
					: 'text-6xl'
			}
		}`}
		>
			<span>Master Bot</span>
		</div>
	);
}
