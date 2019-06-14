import React, { SVGProps } from 'react';
export const CircleWarning = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path fill="none" d="M0 0h24v24H0z" />
		<path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z" fill="#FF1744" />
		<path d="M13 17h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#fff" />
	</svg>
);
