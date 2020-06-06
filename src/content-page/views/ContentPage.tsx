import classnames from 'classnames';
import { cloneDeep, compact, intersection, noop, set } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { BlockImageProps } from '@viaa/avo2-components';

import { ContentBlockPreview } from '../../admin/content-block/components';
import { BlockClickHandler, ContentPageInfo } from '../../admin/content/content.types';
import { ContentBlockConfig, ContentBlockType } from '../../admin/shared/types';
import { getUserGroupIds } from '../../authentication/authentication.service';
import { InteractiveTour } from '../../shared/components';
import withUser, { UserProps } from '../../shared/hocs/withUser';

import './ContentPage.scss';

interface ContentPageDetailProps {
	contentPageInfo: Partial<ContentPageInfo>;
	activeBlockPosition?: number | null;
	onBlockClicked?: BlockClickHandler;
}

const ContentPage: FunctionComponent<ContentPageDetailProps & UserProps> = ({
	contentPageInfo,
	activeBlockPosition,
	onBlockClicked,
	user,
}) => {
	// images can have a setting to go full width
	// so we need to set the block prop: fullWidth to true if we find an image block with size setting: pageWidth
	let contentBlockBlockConfigs = (contentPageInfo.contentBlockConfigs || []).map(
		contentBlockConfig => {
			const width = (contentBlockConfig.components.state as BlockImageProps).width;
			if (
				contentBlockConfig.type === ContentBlockType.Image &&
				width &&
				!width.endsWith('%') &&
				!width.endsWith('px')
			) {
				return set(cloneDeep(contentBlockConfig), 'block.state.fullWidth', true);
			}
			return contentBlockConfig;
		}
	);

	// Add page title as header block for faq items
	if (contentPageInfo.content_type === 'FAQ_ITEM') {
		contentBlockBlockConfigs = [
			({
				position: 0,
				name: 'Titel',
				type: 'HEADING',
				components: {
					state: {
						children: contentPageInfo.title,
						type: 'h1',
						align: 'left',
					},
				},
				block: {
					state: {
						blockType: 'HEADING',
						position: 2,
						backgroundColor: '#FFF',
						headerBackgroundColor: '#FFF',
						padding: {
							top: 'top-extra-large',
							bottom: 'bottom-small',
						},
					},
				},
			} as unknown) as ContentBlockConfig,
			...contentBlockBlockConfigs,
		];
	}

	const getVisibleContentBlocks = (contentBlockConfigs: ContentBlockConfig[]) => {
		return compact(
			contentBlockConfigs.map(
				(contentBlockConfig: ContentBlockConfig): ContentBlockConfig | null => {
					const blockUserGroupIds: number[] =
						contentBlockConfig.block.state.userGroupIds || [];
					const userGroupIds = getUserGroupIds(user);
					if (blockUserGroupIds.length) {
						// Block has special restrictions set
						if (!intersection(blockUserGroupIds, userGroupIds).length) {
							// The user doesn't have the right permissions to see this block
							return null;
						}
					}
					// The user has the right permissions or there are no permissions defined for this block
					return contentBlockConfig;
				}
			)
		);
	};

	return (
		<>
			<InteractiveTour showButton={false} />
			{getVisibleContentBlocks(contentBlockBlockConfigs).map(
				(contentBlockConfig: ContentBlockConfig) => {
					return (
						<ContentBlockPreview
							key={contentBlockConfig.id}
							contentBlockConfig={contentBlockConfig}
							contentPageInfo={contentPageInfo}
							className={classnames(
								`content-block-preview-${contentBlockConfig.position}`,
								{
									'c-content-block__active':
										contentBlockConfig.position === activeBlockPosition,
								}
							)}
							onClick={() =>
								(onBlockClicked || noop)(contentBlockConfig.position, 'preview')
							}
						/>
					);
				}
			)}
		</>
	);
};

export default withUser(ContentPage) as FunctionComponent<ContentPageDetailProps>;
