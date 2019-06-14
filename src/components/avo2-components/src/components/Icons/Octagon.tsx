import React, { SVGProps } from 'react';
export const Octagon = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M16.14 23H7.86a.997.997 0 0 1-.707-.293l-5.86-5.86A1 1 0 0 1 1 16.14V7.86c0-.265.105-.52.293-.707l5.86-5.86A.997.997 0 0 1 7.86 1h8.28c.266 0 .52.105.707.293l5.86 5.86A.997.997 0 0 1 23 7.86v8.28c0 .266-.105.52-.293.707l-5.86 5.86a1 1 0 0 1-.707.293zm-7.866-2h7.452L21 15.726V8.274L15.726 3H8.274L3 8.274v7.452L8.274 21z"
			fill="#000"
		/>
	</svg>
);
