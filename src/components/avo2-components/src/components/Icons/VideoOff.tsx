import React, { SVGProps } from 'react';
export const VideoOff = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<g clipPath="url(#video-off_svg__clip0)" fill="#000">
			<path d="M14 20H3c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h2a1 1 0 0 1 0 2H3c-.551 0-1 .449-1 1v10c0 .552.449 1 1 1h11a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1c0 1.654-1.346 3-3 3zm9-2a1 1 0 0 1-1-1V8.958l-4.414 3.192a.998.998 0 0 1-1.293-.103l-1-1A1 1 0 0 1 15 10.34V7c0-.551-.448-1-1-1h-3.34a1 1 0 0 1 0-2H14c1.654 0 3 1.346 3 3v2.926l.104.104 5.31-3.84c.305-.22.707-.251 1.041-.081.334.171.545.516.545.891v10a1 1 0 0 1-1 1z" />
			<path d="M23 24a.997.997 0 0 1-.707-.293l-22-22A.999.999 0 1 1 1.707.293l22 22A.999.999 0 0 1 23 24z" />
		</g>
		<defs>
			<clipPath id="video-off_svg__clip0">
				<path fill="#fff" d="M0 0h24v24H0z" />
			</clipPath>
		</defs>
	</svg>
);
