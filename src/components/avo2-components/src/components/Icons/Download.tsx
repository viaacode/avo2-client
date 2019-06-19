import React, { SVGProps } from 'react';
export const Download = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M19 22H5c-1.654 0-3-1.346-3-3v-4a1 1 0 1 1 2 0v4c0 .552.449 1 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 1 1 2 0v4c0 1.654-1.346 3-3 3z"
			fill="#000"
		/>
		<path
			d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 1 1 1.414-1.414L12 13.586l4.293-4.293a.999.999 0 1 1 1.414 1.414l-5 5A.997.997 0 0 1 12 16z"
			fill="#000"
		/>
		<path d="M12 16a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v12a1 1 0 0 1-1 1z" fill="#000" />
	</svg>
);
