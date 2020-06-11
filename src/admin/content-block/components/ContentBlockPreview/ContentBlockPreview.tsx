import classnames from 'classnames';
import { get, noop, omit } from 'lodash-es';
import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { ButtonAction, Container, Spacer } from '@viaa/avo2-components';

import { navigateToContentType } from '../../../../shared/helpers';
import withUser, { UserProps } from '../../../../shared/hocs/withUser';
import { ContentPageInfo } from '../../../content/content.types';
import { Color, ContentBlockConfig } from '../../../shared/types';
import { GET_DARK_BACKGROUND_COLOR_OPTIONS } from '../../content-block.const';

import {
	COMPONENT_PREVIEW_MAP,
	CONTENT_PAGE_ACCESS_BLOCKS,
	IGNORE_BLOCK_LEVEL_PROPS,
	NAVIGABLE_CONTENT_BLOCKS,
	REPEATABLE_CONTENT_BLOCKS,
} from './ContentBlockPreview.const';
import './ContentBlockPreview.scss';

interface ContentBlockPreviewProps {
	contentBlockConfig: ContentBlockConfig;
	contentPageInfo: Partial<ContentPageInfo>;
	onClick: () => void;
	className?: string;
}

enum ContentWidthMap {
	REGULAR = 'regular',
	LARGE = 'large',
	MEDIUM = 'medium',
}

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps &
	UserProps &
	RouteComponentProps> = ({
	contentBlockConfig,
	contentPageInfo,
	onClick = noop,
	className,
	history,
	user,
}) => {
	const blockState = get(contentBlockConfig, 'block.state');
	const componentState = get(contentBlockConfig, 'components.state');
	const containerSize = ContentWidthMap[contentPageInfo.content_width || 'REGULAR'];
	const PreviewComponent = COMPONENT_PREVIEW_MAP[contentBlockConfig.type];
	const needsElements = REPEATABLE_CONTENT_BLOCKS.includes(contentBlockConfig.type);
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

	if (NAVIGABLE_CONTENT_BLOCKS.includes(contentBlockConfig.type)) {
		// Pass the navigate function to the block
		blockStateProps.navigate = (buttonAction: ButtonAction) => {
			navigateToContentType(buttonAction, history);
		};
	}

	// Pass the content page object to the block
	if (CONTENT_PAGE_ACCESS_BLOCKS.includes(contentBlockConfig.type)) {
		// Set profile to current user for unsaved pages
		blockStateProps.contentPageInfo = {
			...contentPageInfo,
			profile: contentPageInfo.profile || ({ ...get(user, 'profile', {}), user } as any),
		};
	}

	const hasDarkBg = GET_DARK_BACKGROUND_COLOR_OPTIONS().includes(blockState.backgroundColor);

	return (
		<div
			className={classnames('c-content-block', className)}
			style={{ backgroundColor: blockState.backgroundColor }}
			id={blockState.anchor}
			data-anchor={blockState.anchor}
			ref={blockRef}
			onClick={onClick}
		>
			<Spacer
				className={classnames('c-content-block-preview', {
					'c-content-block-preview--dark': hasDarkBg,
					'u-color-white': hasDarkBg,
				})}
				margin={[
					get(blockState, 'margin.top', 'none'),
					get(blockState, 'margin.bottom', 'none'),
				]}
				padding={[
					get(blockState, 'padding.top', 'none'),
					get(blockState, 'padding.bottom', 'none'),
				]}
			>
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
					<Container
						mode="horizontal"
						size={containerSize === ContentWidthMap.REGULAR ? undefined : containerSize}
					>
						<PreviewComponent {...componentStateProps} {...blockStateProps} />
					</Container>
				)}
			</Spacer>
		</div>
	);
};

export default compose(withRouter, withUser)(ContentBlockPreview) as FunctionComponent<
	ContentBlockPreviewProps
>;
