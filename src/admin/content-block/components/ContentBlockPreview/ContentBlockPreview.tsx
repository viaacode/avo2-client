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
import { DARK_BACKGROUND_COLOR_OPTIONS } from '../../content-block.const';
import {
	COMPONENT_PREVIEW_MAP,
	IGNORE_BLOCK_LEVEL_PROPS,
	NAVIGATEABLE_CONTENT_BLOCKS,
	REPEATABLE_CONTENT_BLOCKS,
} from './ContentBlockPreview.const';

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
	const componentStateProps: any = needsElements
		? { elements: [...componentState] }
		: { ...componentState };

	const blockStateProps = Object.keys(blockState).reduce((acc, key) => {
		const blockValue = (blockState as any)[key];
		const includeBlockValue = blockValue && !IGNORE_BLOCK_LEVEL_PROPS.includes(key);

		return includeBlockValue ? { ...acc, [key]: blockValue } : acc;
	}, {});

	if (NAVIGATEABLE_CONTENT_BLOCKS.includes(blockState.blockType)) {
		componentStateProps.elements.map((element: any) => ({
			...element,
			navigate: () => navigateToContentType(element.buttonAction, history),
		}));
	}

	// TODO: components@1.30.0 - Remove this once ProjectSpotlight block is updated
	if (blockState.blockType === ContentBlockType.ProjectsSpotlight) {
		componentStateProps.navigate = (buttonAction: ButtonAction) => {
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
				<PreviewComponent {...componentStateProps} {...blockStateProps} />
			</Container>
		</Spacer>
	);
};

export default withRouter(ContentBlockPreview);
