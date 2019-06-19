import React, { SVGProps } from 'react';
export const Book = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M4 20.5a1 1 0 0 1-1-1C3 17.57 4.57 16 6.5 16H20a1 1 0 1 1 0 2H6.5c-.827 0-1.5.673-1.5 1.5a1 1 0 0 1-1 1z"
			fill="#000"
		/>
		<path
			d="M20 23H6.5C4.57 23 3 21.43 3 19.5v-15C3 2.57 4.57 1 6.5 1H20a1 1 0 0 1 1 1v20a1 1 0 0 1-1 1zM6.5 3C5.673 3 5 3.673 5 4.5v15c0 .827.673 1.5 1.5 1.5H19V3H6.5z"
			fill="#000"
		/>
	</svg>
);
