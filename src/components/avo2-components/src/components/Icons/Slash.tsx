import React, { SVGProps } from 'react';
export const Slash = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M12 23C5.935 23 1 18.065 1 12S5.935 1 12 1s11 4.935 11 11-4.935 11-11 11zm0-20c-4.962 0-9 4.038-9 9 0 4.963 4.038 9 9 9 4.963 0 9-4.037 9-9 0-4.962-4.037-9-9-9z"
			fill="#000"
		/>
		<path
			d="M19.07 20.07a.997.997 0 0 1-.707-.293L4.223 5.637a.999.999 0 1 1 1.414-1.414l14.14 14.14a.999.999 0 0 1-.707 1.707z"
			fill="#000"
		/>
	</svg>
);
