import React, { SVGProps } from 'react';
export const Home = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M19 23H5c-1.654 0-3-1.346-3-3V9c0-.309.143-.6.386-.79l9-7c.36-.28.867-.28 1.228 0l9 7c.243.19.386.481.386.79v11c0 1.654-1.346 3-3 3zM4 9.489V20c0 .552.449 1 1 1h14a1 1 0 0 0 1-1V9.489l-8-6.222-8 6.222z"
			fill="#000"
		/>
		<path
			d="M15 23a1 1 0 0 1-1-1v-9h-4v9a1 1 0 1 1-2 0V12a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1z"
			fill="#000"
		/>
	</svg>
);
