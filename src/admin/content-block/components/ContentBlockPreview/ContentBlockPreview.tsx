import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { ButtonAction, Container, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { navigateToContentType } from '../../../../shared/helpers';

import { Color, ContentBlockComponentState, ContentBlockState } from '../../../shared/types';
import { GET_DARK_BACKGROUND_COLOR_OPTIONS } from '../../content-block.const';
import {
	COMPONENT_PREVIEW_MAP,
	IGNORE_BLOCK_LEVEL_PROPS,
	NAVIGABLE_CONTENT_BLOCKS,
	REPEATABLE_CONTENT_BLOCKS,
} from './ContentBlockPreview.const';

import { omit } from 'lodash-es';
import './ContentBlockPreview.scss';

interface ContentBlockPreviewProps extends RouteComponentProps {
	componentState: ContentBlockComponentState | ContentBlockComponentState[];
	contentWidth?: Avo.Content.ContentWidth;
	blockState: ContentBlockState;
}

enum ContentWidthMap {
	REGULAR = 'regular',
	LARGE = 'large',
	MEDIUM = 'medium',
}

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps> = ({
	history,
	componentState,
	contentWidth = 'REGULAR',
	blockState,
}) => {
	const containerSize = ContentWidthMap[contentWidth];
	const PreviewComponent = COMPONENT_PREVIEW_MAP[blockState.blockType];
	const needsElements = REPEATABLE_CONTENT_BLOCKS.includes(blockState.blockType);
	const componentStateProps: any = needsElements ? { elements: componentState } : componentState;

	const blockStateProps: { [key: string]: any } = omit(blockState, IGNORE_BLOCK_LEVEL_PROPS);

	if (NAVIGABLE_CONTENT_BLOCKS.includes(blockState.blockType)) {
		// Pass the navigate function to each element (deprecated) => prefer passing the navigate function once to the block
		componentStateProps.elements = componentStateProps.elements.map((element: any) => ({
			...element,
			navigate: () => navigateToContentType(element.buttonAction, history),
		}));
		// Pass the navigate function to the block
		blockStateProps.navigate = (buttonAction: ButtonAction) => {
			navigateToContentType(buttonAction, history);
		};
	}

	const hasDarkBg = GET_DARK_BACKGROUND_COLOR_OPTIONS().includes(blockState.backgroundColor);

	return (
		<div className="c-content-block" style={{ backgroundColor: blockState.backgroundColor }}>
			<div>
				{blockState.headerBackgroundColor !== Color.Transparent && (
					<div
						className="c-content-block__header-bg-color"
						style={{
							backgroundColor: blockState.headerBackgroundColor,
							height: blockState.headerHeight,
						}}
					/>
				)}
				{blockState.fullWidth ? (
					<PreviewComponent {...componentStateProps} {...blockStateProps} />
				) : (
					<Spacer
						className={classnames('c-content-block-preview', {
							'c-content-block-preview--dark': hasDarkBg,
							'u-color-white': hasDarkBg,
						})}
						margin={[]}
						padding={[blockState.padding.top, blockState.padding.bottom]}
					>
						<Container
							mode="horizontal"
							size={
								containerSize === ContentWidthMap.REGULAR
									? undefined
									: containerSize
							}
						>
							<PreviewComponent {...componentStateProps} {...blockStateProps} />
						</Container>
					</Spacer>
				)}
			</div>
		</div>
	);
};

export default withRouter(ContentBlockPreview);
