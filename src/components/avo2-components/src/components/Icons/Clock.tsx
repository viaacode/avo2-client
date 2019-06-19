import React, { SVGProps } from 'react';
export const Clock = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M12 23C5.935 23 1 18.065 1 12S5.935 1 12 1s11 4.935 11 11-4.935 11-11 11zm0-20c-4.962 0-9 4.038-9 9 0 4.963 4.038 9 9 9 4.963 0 9-4.037 9-9 0-4.962-4.037-9-9-9z"
			fill="#000"
		/>
		<path
			d="M15.999 15c-.15 0-.303-.034-.446-.105l-4-2A1.001 1.001 0 0 1 11 12V6a1 1 0 0 1 2 0v5.382l3.447 1.724A1 1 0 0 1 15.999 15z"
			fill="#000"
		/>
	</svg>
);
