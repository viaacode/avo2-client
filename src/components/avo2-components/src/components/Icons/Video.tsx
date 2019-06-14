import React, { SVGProps } from 'react';
export const Video = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M23 18a.988.988 0 0 1-.581-.187l-7-5a.997.997 0 0 1 0-1.627l7-5A1 1 0 0 1 24 7v10a1.001 1.001 0 0 1-1 1zm-5.279-6L22 15.057V8.943L17.721 12z"
			fill="#000"
		/>
		<path
			d="M14 20H3c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h11c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3zM3 6c-.551 0-1 .449-1 1v10c0 .552.449 1 1 1h11a1 1 0 0 0 1-1V7c0-.551-.448-1-1-1H3z"
			fill="#000"
		/>
	</svg>
);
