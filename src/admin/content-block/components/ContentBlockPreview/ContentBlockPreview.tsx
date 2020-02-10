import classnames from 'classnames';
import React, { FunctionComponent } from 'react';

import {
	BlockAccordions,
	BlockButtons,
	BlockCTAs,
	BlockHeading,
	BlockIFrame,
	BlockIntro,
	BlockRichText,
	ButtonAction,
	Container,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../../authentication/components/SecuredRoute';
import { navigate } from '../../../../shared/helpers';

import {
	ContentBlockBackgroundColor,
	ContentBlockComponentState,
	ContentBlockState,
	ContentBlockType,
} from '../../content-block.types';

interface ContentBlockPreviewProps extends DefaultSecureRouteProps<> {
	componentState: ContentBlockComponentState | ContentBlockComponentState[];
	contentWidth?: Avo.Content.ContentWidth;
	blockState: ContentBlockState;
}

enum ContentWidthMap {
	REGULAR = 'regular',
	LARGE = 'large',
	MEDIUM = 'medium',
}

const COMPONENT_PREVIEW_MAP = Object.freeze({
	[ContentBlockType.CTAs]: BlockCTAs,
	[ContentBlockType.Buttons]: BlockButtons,
	[ContentBlockType.Heading]: BlockHeading,
	[ContentBlockType.Intro]: BlockIntro,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
	[ContentBlockType.IFrame]: BlockIFrame,
	[ContentBlockType.Accordions]: BlockAccordions,
});

const REPEATABLE_CONTENT_BLOCKS = [
	ContentBlockType.Accordions,
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.RichText,
	ContentBlockType.RichTextTwoColumns,
];

export const BLOCK_STATE_INHERITING_PROPS = ['align'];

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps> = ({
	history,
	match,
	componentState,
	contentWidth = 'REGULAR',
	blockState,
}) => {
	const containerSize = ContentWidthMap[contentWidth];
	const PreviewComponent = COMPONENT_PREVIEW_MAP[blockState.blockType];
	const needsElements = REPEATABLE_CONTENT_BLOCKS.includes(blockState.blockType);
	const stateToSpread: any = needsElements ? { elements: componentState } : componentState;

	BLOCK_STATE_INHERITING_PROPS.forEach((prop: string) => {
		if ((blockState as any)[prop]) {
			stateToSpread[prop] = (blockState as any)[prop];
		}
	});

	if (blockState.blockType === ContentBlockType.CTAs) {
		stateToSpread.elements.forEach((innerState: any) => {
			innerState.buttonAction = innerState.buttonActions;
			innerState.navigate = (buttonActions: ButtonAction) => {
				switch (buttonActions.type) {
					case 'EXTERNAL_LINK':
						history.push(buttonActions.value);
						break;
					default:
						break;
				}
				// console.log(buildLink(CONTENT_PATH.CONTENT_DETAIL, { id })
				console.log('preview: buttonActions', buttonActions);
			};
		});
	}

	return (
		// TODO: Extend spacer with paddings in components lib
		// This way we can easily set paddings from a content-blocks blockState
		<div
			className={classnames(`u-bg-${blockState.backgroundColor} u-padding`, {
				'u-color-white': blockState.backgroundColor === ContentBlockBackgroundColor.NightBlue,
			})}
		>
			<Container
				mode="horizontal"
				size={containerSize === ContentWidthMap.REGULAR ? undefined : containerSize}
			>
				<PreviewComponent {...stateToSpread} />
			</Container>
		</div>
	);
};

export default ContentBlockPreview;
