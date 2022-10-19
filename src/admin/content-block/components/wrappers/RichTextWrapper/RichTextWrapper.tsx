import { BlockRichText, BlockRichTextProps } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

const RichTextWrapper: FunctionComponent<
	Omit<BlockRichTextProps, 'maxTextWidth'> & {
		limitWidth?: boolean;
	}
> = ({ limitWidth, ...rest }) => {
	return <BlockRichText {...rest} {...(limitWidth ? { maxTextWidth: '800px' } : {})} />;
};

export default RichTextWrapper;
