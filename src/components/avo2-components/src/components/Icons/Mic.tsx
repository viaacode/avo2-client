import React, { SVGProps } from 'react';
export const Mic = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M12 16c-2.206 0-4-1.794-4-4V4c0-2.206 1.794-4 4-4s4 1.794 4 4v8c0 2.206-1.794 4-4 4zm0-14c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2s2-.897 2-2V4c0-1.103-.897-2-2-2z"
			fill="#000"
		/>
		<path
			d="M12 20c-4.411 0-8-3.589-8-8v-2a1 1 0 0 1 2 0v2c0 3.309 2.691 6 6 6s6-2.691 6-6v-2a1 1 0 1 1 2 0v2c0 4.411-3.589 8-8 8z"
			fill="#000"
		/>
		<path d="M12 24a1 1 0 0 1-1-1v-4a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1z" fill="#000" />
		<path d="M16 24H8a1 1 0 1 1 0-2h8a1 1 0 1 1 0 2z" fill="#000" />
	</svg>
);
