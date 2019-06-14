import React, { SVGProps } from 'react';
export const XSquare = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M19 22H5c-1.654 0-3-1.346-3-3V5c0-1.654 1.346-3 3-3h14c1.654 0 3 1.346 3 3v14c0 1.654-1.346 3-3 3zM5 4c-.551 0-1 .449-1 1v14c0 .552.449 1 1 1h14a1 1 0 0 0 1-1V5c0-.551-.448-1-1-1H5z"
			fill="#000"
		/>
		<path
			d="M15 16a.997.997 0 0 1-.707-.293l-6-6a.999.999 0 1 1 1.414-1.414l6 6A.999.999 0 0 1 15 16z"
			fill="#000"
		/>
		<path
			d="M9 16a.999.999 0 0 1-.707-1.707l6-6a.999.999 0 1 1 1.414 1.414l-6 6A.997.997 0 0 1 9 16z"
			fill="#000"
		/>
	</svg>
);
