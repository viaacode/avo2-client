import React, { FunctionComponent } from 'react';

import { Heading } from '@viaa/avo2-components';

import { HeadingBlockFormState } from '../../../content-block.types';

// TODO: these should go to the components lib under ContentBlocks
// Also maybe we should base the config's formState properties on the component's props
const HeadingBlockPreview: FunctionComponent<HeadingBlockFormState> = ({ align, level, title }) => (
	<Heading className={`u-text-${align}`} type={level}>
		{title}
	</Heading>
);

export default HeadingBlockPreview;
