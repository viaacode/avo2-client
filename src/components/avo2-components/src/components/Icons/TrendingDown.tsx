import React, { SVGProps } from 'react';
export const TrendingDown = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<g clipPath="url(#trending-down_svg__clip0)" fill="#000">
			<path d="M23 19a.997.997 0 0 1-.707-.293L13.5 9.914l-4.293 4.293a.999.999 0 0 1-1.414 0l-7.5-7.5a.999.999 0 1 1 1.414-1.414L8.5 12.086l4.293-4.293a.999.999 0 0 1 1.414 0l9.5 9.5A.999.999 0 0 1 23 19z" />
			<path d="M23 19h-6a1 1 0 1 1 0-2h5v-5a1 1 0 1 1 2 0v6a1 1 0 0 1-1 1z" />
		</g>
		<defs>
			<clipPath id="trending-down_svg__clip0">
				<path fill="#fff" d="M0 0h24v24H0z" />
			</clipPath>
		</defs>
	</svg>
);
