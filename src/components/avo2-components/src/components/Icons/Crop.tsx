import React, { SVGProps } from 'react';
export const Crop = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<g clipPath="url(#crop_svg__clip0)" fill="#000">
			<path d="M23 19H8c-1.654 0-3-1.346-3-3L5.13.991a1 1 0 0 1 1-.991h.009a1 1 0 0 1 .991 1.009l-.13 15A1 1 0 0 0 8 17h15a1 1 0 1 1 0 2z" />
			<path d="M18 24a1 1 0 0 1-1-1V8c0-.551-.448-1-1-1l-14.991.13H1a1 1 0 0 1-.009-2l15-.13A3.006 3.006 0 0 1 19 8v15a1 1 0 0 1-1 1z" />
		</g>
		<defs>
			<clipPath id="crop_svg__clip0">
				<path fill="#fff" d="M0 0h24v24H0z" />
			</clipPath>
		</defs>
	</svg>
);
