import React, { SVGProps } from 'react';
export const Copy = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M20 23h-9c-1.654 0-3-1.346-3-3v-9c0-1.654 1.346-3 3-3h9c1.654 0 3 1.346 3 3v9c0 1.654-1.346 3-3 3zm-9-13c-.551 0-1 .449-1 1v9c0 .552.449 1 1 1h9a1 1 0 0 0 1-1v-9c0-.551-.448-1-1-1h-9z"
			fill="#000"
		/>
		<path
			d="M5 16H4c-1.654 0-3-1.346-3-3V4c0-1.654 1.346-3 3-3h9c1.654 0 3 1.346 3 3v1a1 1 0 1 1-2 0V4c0-.551-.448-1-1-1H4c-.551 0-1 .449-1 1v9c0 .552.449 1 1 1h1a1 1 0 1 1 0 2z"
			fill="#000"
		/>
	</svg>
);
