import React, { Fragment, FunctionComponent } from 'react';

import { Swatch } from './Swatch';
import { SwatchList } from './SwatchList';

export interface SwatchBlockProps {
	title?: string;
	colors: {
		name: string;
		value: string;
	}[];
}

export const SwatchBlock: FunctionComponent<SwatchBlockProps> = ({
	title,
	colors,
}: SwatchBlockProps) => (
	<Fragment>
		{title && <h1 className="c-h1">{title}</h1>}
		<SwatchList>
			{colors.map(({ name, value }, index) => (
				<Swatch key={index} color={value} name={name} />
			))}
		</SwatchList>
	</Fragment>
);
