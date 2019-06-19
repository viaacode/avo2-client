import React, { SVGProps } from 'react';
export const TrendingUp = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<g clipPath="url(#trending-up_svg__clip0)" fill="#000">
			<path d="M1 19a.999.999 0 0 1-.707-1.707l7.5-7.5a.999.999 0 0 1 1.414 0l4.293 4.293 8.793-8.793a.999.999 0 1 1 1.414 1.414l-9.5 9.5a.999.999 0 0 1-1.414 0L8.5 11.914l-6.793 6.793A.997.997 0 0 1 1 19z" />
			<path d="M23 13a1 1 0 0 1-1-1V7h-5a1 1 0 1 1 0-2h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1z" />
		</g>
		<defs>
			<clipPath id="trending-up_svg__clip0">
				<path fill="#fff" d="M0 0h24v24H0z" />
			</clipPath>
		</defs>
	</svg>
);
