import React, { SVGProps } from 'react';
export const ChevronLeft = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M15 19a.997.997 0 0 1-.707-.293l-6-6a.999.999 0 0 1 0-1.414l6-6a.999.999 0 1 1 1.414 1.414L10.414 12l5.293 5.293A.999.999 0 0 1 15 19z"
			fill="#000"
		/>
	</svg>
);
