import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { ButtonAction, Container, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { navigateToContentType } from '../../../../shared/helpers';

import {
	ContentBlockComponentState,
	ContentBlockState,
	ContentBlockType,
} from '../../../shared/types';
import {
	CONTENT_BLOCK_INITIAL_BLOCK_STATE_MAP,
	DARK_BACKGROUND_COLOR_OPTIONS,
} from '../../content-block.const';
import {
	COMPONENT_PREVIEW_MAP,
	IGNORE_BLOCK_LEVEL_PROPS,
	REPEATABLE_CONTENT_BLOCKS,
} from './ContentBlockPreview.const';

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
	const stateToSpread: any = needsElements ? { elements: componentState } : componentState;

	const initialBlockLevelState = CONTENT_BLOCK_INITIAL_BLOCK_STATE_MAP[blockState.blockType];
	Object.keys(initialBlockLevelState(0)).forEach((prop: string) => {
		if ((blockState as any)[prop] && !IGNORE_BLOCK_LEVEL_PROPS.includes(prop)) {
			stateToSpread[prop] = (blockState as any)[prop];
		}
	});

	if (
		blockState.blockType === ContentBlockType.CTAs ||
		blockState.blockType === ContentBlockType.Buttons
	) {
		stateToSpread.elements.forEach((innerState: any) => {
			innerState.navigate = () => {
				navigateToContentType(innerState.buttonAction, history);
			};
		});
	}

	if (blockState.blockType === ContentBlockType.ProjectsSpotlight) {
		stateToSpread.navigate = (buttonAction: ButtonAction) => {
			navigateToContentType(buttonAction, history);
		};
	}

	const hasDarkBg = DARK_BACKGROUND_COLOR_OPTIONS.includes(blockState.backgroundColor);

	return (
		<Spacer
			className={classnames('c-content-block-preview', `u-bg-${blockState.backgroundColor}`, {
				'c-content-block-preview--dark': hasDarkBg,
				'u-color-white': hasDarkBg,
			})}
			margin={[]}
			padding={[blockState.padding.top, blockState.padding.bottom]}
		>
			<Container
				mode="horizontal"
				size={containerSize === ContentWidthMap.REGULAR ? undefined : containerSize}
			>
				<PreviewComponent {...stateToSpread} />
			</Container>
		</Spacer>
	);
};

export default withRouter(ContentBlockPreview);
