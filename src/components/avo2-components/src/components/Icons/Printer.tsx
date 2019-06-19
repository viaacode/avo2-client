import React, { SVGProps } from 'react';
export const Printer = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M18 10a1 1 0 0 1-1-1V3H7v6a1 1 0 0 1-2 0V2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1z"
			fill="#000"
		/>
		<path
			d="M20 19h-2a1 1 0 1 1 0-2h2a1 1 0 0 0 1-1v-5c0-.551-.448-1-1-1H4c-.551 0-1 .449-1 1v5c0 .552.449 1 1 1h2a1 1 0 1 1 0 2H4c-1.654 0-3-1.346-3-3v-5c0-1.654 1.346-3 3-3h16c1.654 0 3 1.346 3 3v5c0 1.654-1.346 3-3 3z"
			fill="#000"
		/>
		<path
			d="M18 23H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1zM7 21h10v-6H7v6z"
			fill="#000"
		/>
	</svg>
);
