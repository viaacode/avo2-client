import React, { SVGProps } from 'react';
export const ChevronRight = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M9 19a.999.999 0 0 1-.707-1.707L13.586 12 8.293 6.707a.999.999 0 1 1 1.414-1.414l6 6a.999.999 0 0 1 0 1.414l-6 6A.997.997 0 0 1 9 19z"
			fill="#000"
		/>
	</svg>
);
