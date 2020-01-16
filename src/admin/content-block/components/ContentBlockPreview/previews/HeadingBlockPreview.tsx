import React, { FunctionComponent } from 'react';

import { BlockHeading } from '@viaa/avo2-components';

import { HeadingBlockComponentState } from '../../../content-block.types';

// TODO: these should go to the components lib under ContentBlocks
// Also maybe we should base the config's formState properties on the component's props
const HeadingBlockPreview: FunctionComponent<HeadingBlockComponentState> = ({
	align,
	level,
	title,
}) => {
	return (
		<BlockHeading className={`u-text-${align}`} type={level}>
			{title}
		</BlockHeading>
	);
};

export default HeadingBlockPreview;
