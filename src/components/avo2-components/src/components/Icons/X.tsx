import React, { SVGProps } from 'react';
export const X = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M6 19a.999.999 0 0 1-.707-1.707l12-12a.999.999 0 1 1 1.414 1.414l-12 12A.997.997 0 0 1 6 19z"
			fill="#000"
		/>
		<path
			d="M18 19a.997.997 0 0 1-.707-.293l-12-12a.999.999 0 1 1 1.414-1.414l12 12A.999.999 0 0 1 18 19z"
			fill="#000"
		/>
	</svg>
);
