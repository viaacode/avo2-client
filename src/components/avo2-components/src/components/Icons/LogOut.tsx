import React, { SVGProps } from 'react';
export const LogOut = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M9 22H5c-1.654 0-3-1.346-3-3V5c0-1.654 1.346-3 3-3h4a1 1 0 0 1 0 2H5c-.551 0-1 .449-1 1v14c0 .552.449 1 1 1h4a1 1 0 1 1 0 2zM16 18a.999.999 0 0 1-.707-1.707L19.586 12l-4.293-4.293a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1 0 1.414l-5 5A.997.997 0 0 1 16 18z"
			fill="#000"
		/>
		<path d="M21 13H9a1 1 0 0 1 0-2h12a1 1 0 1 1 0 2z" fill="#000" />
	</svg>
);
