import React, { SVGProps } from 'react';
export const Eye = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<g clipPath="url(#eye_svg__clip0)" fill="#000">
			<path d="M12 21C4.469 21 .28 12.796.105 12.447a1 1 0 0 1 0-.895C.28 11.204 4.469 3 12 3s11.72 8.204 11.895 8.553a1 1 0 0 1 0 .895C23.72 12.796 19.531 21 12 21zm-9.858-9.001C3.079 13.607 6.623 19 12 19c5.394 0 8.924-5.389 9.858-6.999C20.921 10.393 17.377 5 12 5c-5.394 0-8.924 5.389-9.858 6.999z" />
			<path d="M12 16c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4zm0-6c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z" />
		</g>
		<defs>
			<clipPath id="eye_svg__clip0">
				<path fill="#fff" d="M0 0h24v24H0z" />
			</clipPath>
		</defs>
	</svg>
);
