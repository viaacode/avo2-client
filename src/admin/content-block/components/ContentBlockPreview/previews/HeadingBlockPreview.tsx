import React, { FunctionComponent } from 'react';

import { Heading } from '@viaa/avo2-components';

import { HeadingBlockFormState } from '../../../content-block.types';

const HeadingBlockPreview: FunctionComponent<HeadingBlockFormState> = ({ align, level, title }) => (
	<Heading className={`u-text-${align}`} type={level}>
		{title}
	</Heading>
);

export default HeadingBlockPreview;
