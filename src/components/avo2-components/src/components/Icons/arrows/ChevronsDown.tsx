import React, { SVGProps } from 'react';
export const ChevronsDown = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M12 19a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 1 1 1.414-1.414L12 16.586l4.293-4.293a.999.999 0 1 1 1.414 1.414l-5 5A.997.997 0 0 1 12 19z"
			fill="#000"
		/>
		<path
			d="M12 12a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 1 1 1.414-1.414L12 9.586l4.293-4.293a.999.999 0 1 1 1.414 1.414l-5 5A.997.997 0 0 1 12 12z"
			fill="#000"
		/>
	</svg>
);
