import React, { SVGProps } from 'react';
export const Italic = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M19 5h-9a1 1 0 0 1 0-2h9a1 1 0 1 1 0 2zM14 21H5a1 1 0 1 1 0-2h9a1 1 0 1 1 0 2z"
			fill="#000"
		/>
		<path
			d="M9 21a1 1 0 0 1-.936-1.351l6-16a1 1 0 0 1 1.873.703l-6 16A1.001 1.001 0 0 1 9 21z"
			fill="#000"
		/>
	</svg>
);
