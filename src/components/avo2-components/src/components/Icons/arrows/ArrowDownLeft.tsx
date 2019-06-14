import React, { SVGProps } from 'react';
export const ArrowDownLeft = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M7 18a.999.999 0 0 1-.707-1.707l10-10a.999.999 0 1 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18z"
			fill="#000"
		/>
		<path d="M17 18H7a1 1 0 0 1-1-1V7a1 1 0 0 1 2 0v9h9a1 1 0 1 1 0 2z" fill="#000" />
	</svg>
);
