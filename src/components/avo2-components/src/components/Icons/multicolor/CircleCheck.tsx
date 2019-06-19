import React, { SVGProps } from 'react';
export const CircleCheck = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path fill="none" d="M0 0h24v24H0z" />
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#1FC5A0" />
		<path d="M5 12l5 5 9-9-1.41-1.42L10 14.17l-3.59-3.58L5 12z" fill="#fff" />
	</svg>
);
