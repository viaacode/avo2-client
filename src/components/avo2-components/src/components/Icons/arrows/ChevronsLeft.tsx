import React, { SVGProps } from 'react';
export const ChevronsLeft = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M11 18a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L7.414 12l4.293 4.293A.999.999 0 0 1 11 18z"
			fill="#000"
		/>
		<path
			d="M18 18a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L14.414 12l4.293 4.293A.999.999 0 0 1 18 18z"
			fill="#000"
		/>
	</svg>
);
