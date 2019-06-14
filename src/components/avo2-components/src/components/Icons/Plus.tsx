import React, { SVGProps } from 'react';
export const Plus = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path d="M12 20a1 1 0 0 1-1-1V5a1 1 0 0 1 2 0v14a1 1 0 0 1-1 1z" fill="#000" />
		<path d="M19 13H5a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2z" fill="#000" />
	</svg>
);
