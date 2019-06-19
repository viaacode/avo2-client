import React, { SVGProps } from 'react';
export const BookOpen = (props: SVGProps<SVGSVGElement>) => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
		<path
			d="M12 22a1 1 0 0 1-1-1c0-1.103-.897-2-2-2H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6c2.757 0 5 2.243 5 5v14a1 1 0 0 1-1 1zm-9-5h6a3.97 3.97 0 0 1 2 .537V7c0-1.654-1.346-3-3-3H3v13z"
			fill="#000"
		/>
		<path
			d="M12 22a1 1 0 0 1-1-1V7c0-2.757 2.243-5 5-5h6a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-7c-1.103 0-2 .897-2 2a1 1 0 0 1-1 1zm4-18c-1.654 0-3 1.346-3 3v10.537A3.97 3.97 0 0 1 15 17h6V4h-5z"
			fill="#000"
		/>
	</svg>
);
