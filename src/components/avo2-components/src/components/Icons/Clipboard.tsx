import React, { SVGProps } from 'react';
export const Clipboard = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M18 23H6c-1.654 0-3-1.346-3-3V6c0-1.654 1.346-3 3-3h2a1 1 0 0 1 0 2H6c-.551 0-1 .449-1 1v14c0 .552.449 1 1 1h12a1 1 0 0 0 1-1V6c0-.551-.448-1-1-1h-2a1 1 0 1 1 0-2h2c1.654 0 3 1.346 3 3v14c0 1.654-1.346 3-3 3z"
			fill="#000"
		/>
		<path
			d="M15 7H9c-1.103 0-2-.897-2-2V3c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v2c0 1.103-.897 2-2 2zM9 3h-.001L9 5h6V3H9z"
			fill="#000"
		/>
	</svg>
);
