import { AlignOptions, BlockImageGrid, ButtonAction, GridItem } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

export interface BlockUspGridWrapperProps {
	elements: GridItem[];
	textAlign?: AlignOptions;
	className?: string;
	navigate?: (buttonAction: ButtonAction) => void;
}

const BlockUspGridWrapper: FunctionComponent<BlockUspGridWrapperProps> = ({ ...rest }) => {
	return (
		<div style={{ width: 'calc(100% + 124px)', marginLeft: '-62px' }}>
			<BlockImageGrid
				imageWidth={325}
				imageHeight={75}
				itemWidth={325}
				horizontalMargin={124}
				verticalMargin={82}
				textSize={20}
				textMargin={20}
				textWeight={500}
				fill="contain"
				{...rest}
			/>
		</div>
	);
};

export default BlockUspGridWrapper;
