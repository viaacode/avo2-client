import React, { SVGProps } from 'react';
export const Lock = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M19 23H5c-1.654 0-3-1.346-3-3v-7c0-1.654 1.346-3 3-3h14c1.654 0 3 1.346 3 3v7c0 1.654-1.346 3-3 3zM5 12c-.551 0-1 .449-1 1v7c0 .552.449 1 1 1h14a1 1 0 0 0 1-1v-7c0-.551-.448-1-1-1H5z"
			fill="#000"
		/>
		<path
			d="M17 12a1 1 0 0 1-1-1V7c0-2.206-1.794-4-4-4S8 4.794 8 7v4a1 1 0 0 1-2 0V7c0-3.309 2.691-6 6-6s6 2.691 6 6v4a1 1 0 0 1-1 1z"
			fill="#000"
		/>
	</svg>
);
