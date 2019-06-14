import React, { SVGProps } from 'react';
export const ArrowLeft = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path d="M19 13H5a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2z" fill="#000" />
		<path
			d="M12 20a.997.997 0 0 1-.707-.293l-7-7a.999.999 0 0 1 0-1.414l7-7a.999.999 0 1 1 1.414 1.414L6.414 12l6.293 6.293A.999.999 0 0 1 12 20z"
			fill="#000"
		/>
	</svg>
);
