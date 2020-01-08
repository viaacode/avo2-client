import React, { FunctionComponent } from 'react';

import { Heading } from '@viaa/avo2-components';

import { HeadingBlockComponentState } from '../../../content-block.types';

// TODO: these should go to the components lib under ContentBlocks
// Also maybe we should base the config's formState properties on the component's props
const HeadingBlockPreview: FunctionComponent<HeadingBlockComponentState> = ({
	align,
	level,
	title,
}) => {
	return (
		<Heading className={`u-text-${align}`} type={level}>
			{title}
		</Heading>
	);
};

export default HeadingBlockPreview;
