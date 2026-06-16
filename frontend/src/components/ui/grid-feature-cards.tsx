import { cn } from '@/lib/utils';
import React from 'react';

type FeatureType = {
	title: string;
	icon: React.ComponentType<any>;
	description: string;
};

type FeatureCardProps = React.ComponentProps<'div'> & {
	feature: FeatureType;
};

export function FeatureCard({ feature, className, ...props }: FeatureCardProps) {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);

	const p = React.useMemo(() => {
		if (!mounted) return [];
		return genRandomPattern();
	}, [mounted]);

	return (
		<div 
			className={cn('relative overflow-hidden border-gray-800 bg-black/40 hover:bg-white/[0.02] transition-all duration-300 group', className)} 
			style={{ 
				padding: '40px 32px', // Spacious padding inside the card
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-start',
				minHeight: '250px', // Nice height
				position: 'relative',
				boxSizing: 'border-box'
			}} 
			{...props}
		>
			<div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
				<div className="from-white/5 to-white/0 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
					<GridPattern
						width={20}
						height={20}
						x="-12"
						y="4"
						squares={p}
						className="fill-white/5 stroke-white/10 absolute inset-0 h-full w-full mix-blend-overlay"
					/>
				</div>
			</div>
			
			<div style={{ marginBottom: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<feature.icon className="text-white/60 group-hover:text-white transition-colors duration-200" style={{ width: '24px', height: '24px' }} strokeWidth={1.5} aria-hidden />
			</div>

			<h3 style={{ textTransform: 'none', color: '#ffffff', fontSize: '16px', fontWeight: 500, marginTop: '32px', marginBottom: '8px', letterSpacing: '-0.01em' }}>
				{feature.title}
			</h3>
			
			<p style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 300, lineHeight: '1.6', margin: 0 }}>
				{feature.description}
			</p>
		</div>
	);
}

function GridPattern({
	width,
	height,
	x,
	y,
	squares,
	...props
}: React.ComponentProps<'svg'> & { width: number; height: number; x: string; y: string; squares?: number[][] }) {
	const patternId = React.useId();

	return (
		<svg aria-hidden="true" {...props}>
			<defs>
				<pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
					<path d={`M.5 ${height}V.5H${width}`} fill="none" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
			{squares && (
				<svg x={x} y={y} className="overflow-visible">
					{squares.map(([x, y], index) => (
						<rect strokeWidth="0" key={index} width={width + 1} height={height + 1} x={x * width} y={y * height} />
					))}
				</svg>
			)}
		</svg>
	);
}

function genRandomPattern(length?: number): number[][] {
	length = length ?? 5;
	return Array.from({ length }, () => [
		Math.floor(Math.random() * 4) + 7, // random x between 7 and 10
		Math.floor(Math.random() * 6) + 1, // random y between 1 and 6
	]);
}
