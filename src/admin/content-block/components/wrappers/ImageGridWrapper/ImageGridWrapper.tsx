import React, { FunctionComponent } from 'react';

import { AlignOptions, BlockImageGrid, ButtonAction, GridItem } from '@viaa/avo2-components';

import { BlockGridFormatOption, FillOption } from '../../../../shared/types';

export interface BlockGridWrapperProps {
	elements: GridItem[];
	format: BlockGridFormatOption;
	fill?: FillOption;
	textAlign?: AlignOptions;
	className?: string;
	navigate?: (buttonAction: ButtonAction) => void;
}

const formatLookup: {
	[format in BlockGridFormatOption]: {
		imageWidth: number;
		imageHeight: number;
		itemWidth: number;
	};
} = {
	squareSmall: { imageWidth: 200, imageHeight: 200, itemWidth: 200 },
	squareLarge: { imageWidth: 275, imageHeight: 275, itemWidth: 275 },
	'4:3': { imageWidth: 400, imageHeight: 300, itemWidth: 400 },
	'2:1': { imageWidth: 200, imageHeight: 100, itemWidth: 200 },
	'6:9': { imageWidth: 400, imageHeight: 225, itemWidth: 400 },
};

const BlockGridWrapper: FunctionComponent<BlockGridWrapperProps> = ({
	format = 'squareLarge',
	...rest
}) => {
	return <BlockImageGrid {...formatLookup[format]} {...rest} />;
};

export default BlockGridWrapper;
