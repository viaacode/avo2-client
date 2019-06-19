import React, { SVGProps } from 'react';
export const ExternalLink = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M16 22H5c-1.654 0-3-1.346-3-3V8c0-1.654 1.346-3 3-3h6a1 1 0 0 1 0 2H5c-.551 0-1 .449-1 1v11c0 .552.449 1 1 1h11a1 1 0 0 0 1-1v-6a1 1 0 1 1 2 0v6c0 1.654-1.346 3-3 3zM21 10a1 1 0 0 1-1-1V4h-5a1 1 0 1 1 0-2h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1z"
			fill="#000"
		/>
		<path
			d="M10 15a.999.999 0 0 1-.707-1.707l11-11a.999.999 0 1 1 1.414 1.414l-11 11A.997.997 0 0 1 10 15z"
			fill="#000"
		/>
	</svg>
);
