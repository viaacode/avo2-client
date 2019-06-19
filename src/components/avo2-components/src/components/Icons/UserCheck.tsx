import React, { SVGProps } from 'react';
export const UserCheck = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<g clipPath="url(#user-check_svg__clip0)" fill="#000">
			<path d="M16 22a1 1 0 0 1-1-1v-2c0-1.654-1.346-3-3-3H5c-1.654 0-3 1.346-3 3v2a1 1 0 1 1-2 0v-2c0-2.757 2.243-5 5-5h7c2.757 0 5 2.243 5 5v2a1 1 0 0 1-1 1zM8.5 12c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zM19 14a.997.997 0 0 1-.707-.293l-2-2a.999.999 0 1 1 1.414-1.414L19 11.586l3.293-3.293a.999.999 0 1 1 1.414 1.414l-4 4A.997.997 0 0 1 19 14z" />
		</g>
		<defs>
			<clipPath id="user-check_svg__clip0">
				<path fill="#fff" d="M0 0h24v24H0z" />
			</clipPath>
		</defs>
	</svg>
);
