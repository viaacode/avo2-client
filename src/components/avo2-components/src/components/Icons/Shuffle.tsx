import React, { SVGProps } from 'react';
export const Shuffle = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path d="M21 9a1 1 0 0 1-1-1V4h-4a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1z" fill="#000" />
		<path
			d="M4 21a.999.999 0 0 1-.707-1.707l17-17a.999.999 0 1 1 1.414 1.414l-17 17A.997.997 0 0 1 4 21zM21 22h-5a1 1 0 1 1 0-2h4v-4a1 1 0 1 1 2 0v5a1 1 0 0 1-1 1z"
			fill="#000"
		/>
		<path
			d="M21 22a.997.997 0 0 1-.707-.293l-6-6a.999.999 0 1 1 1.414-1.414l6 6A.999.999 0 0 1 21 22zM9 10a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 1 1 1.414-1.414l5 5A.999.999 0 0 1 9 10z"
			fill="#000"
		/>
	</svg>
);
