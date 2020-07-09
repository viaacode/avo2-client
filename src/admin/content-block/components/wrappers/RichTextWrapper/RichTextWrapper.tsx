import React, { FunctionComponent } from 'react';

import { BlockRichText, BlockRichTextProps } from '@viaa/avo2-components';

const RichTextWrapper: FunctionComponent<Omit<BlockRichTextProps, 'maxTextWidth'>> = props => {
	return <BlockRichText {...props} maxTextWidth="800px" />;
};

export default RichTextWrapper;
