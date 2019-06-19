import React, { SVGProps } from 'react';
export const ChevronUp = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M18 16a.997.997 0 0 1-.707-.293L12 10.414l-5.293 5.293a.999.999 0 1 1-1.414-1.414l6-6a.999.999 0 0 1 1.414 0l6 6A.999.999 0 0 1 18 16z"
			fill="#000"
		/>
	</svg>
);
