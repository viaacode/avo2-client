import classnames from 'classnames';
import { omit } from 'lodash-es';
import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
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

	const blockRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

	const blockStateProps: { [key: string]: any } = omit(blockState, IGNORE_BLOCK_LEVEL_PROPS);

	const [headerHeight, setHeaderHeight] = useState<string>('0');

	const updateHeaderHeight = () => {
		if (!blockRef.current) {
			setHeaderHeight('0');
			return;
		}
		const header = blockRef.current.querySelector('.c-content-page-overview-block__header');
		if (!header) {
			setHeaderHeight('0');
			return;
		}
		const height = header.getBoundingClientRect().height || 0;
		setHeaderHeight(`${height + 16}px`);
	};

	useEffect(() => {
		if (blockState.headerBackgroundColor) {
			// Header background color div has to be resized when the window resizes
			window.addEventListener('resize', updateHeaderHeight);
		}
	}, [blockState.headerBackgroundColor]);

	useEffect(updateHeaderHeight, [blockRef.current, blockState, componentState]);

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
		<div
			className="c-content-block"
			style={{ backgroundColor: blockState.backgroundColor }}
			id={blockState.anchor}
			data-anchor={blockState.anchor}
			ref={blockRef}
		>
			<div>
				{blockState.headerBackgroundColor !== Color.Transparent && (
					<div
						className="c-content-block__header-bg-color"
						style={{
							backgroundColor: blockState.headerBackgroundColor,
							height: headerHeight,
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
