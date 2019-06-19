import React, { SVGProps } from 'react';
export const Repeat = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<g clipPath="url(#repeat_svg__clip0)" fill="#000">
			<path d="M17 10a.999.999 0 0 1-.707-1.707L19.586 5l-3.293-3.293A.999.999 0 1 1 17.707.293l4 4a.999.999 0 0 1 0 1.414l-4 4A.997.997 0 0 1 17 10z" />
			<path d="M3 12a1 1 0 0 1-1-1V9c0-2.757 2.243-5 5-5h14a1 1 0 1 1 0 2H7C5.346 6 4 7.346 4 9v2a1 1 0 0 1-1 1zM7 24a.997.997 0 0 1-.707-.293l-4-4a.999.999 0 0 1 0-1.414l4-4a.999.999 0 1 1 1.414 1.414L4.414 19l3.293 3.293A.999.999 0 0 1 7 24z" />
			<path d="M17 20H3a1 1 0 1 1 0-2h14c1.654 0 3-1.346 3-3v-2a1 1 0 1 1 2 0v2c0 2.757-2.243 5-5 5z" />
		</g>
		<defs>
			<clipPath id="repeat_svg__clip0">
				<path fill="#fff" d="M0 0h24v24H0z" />
			</clipPath>
		</defs>
	</svg>
);
