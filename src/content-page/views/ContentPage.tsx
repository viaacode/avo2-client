import { cloneDeep, compact, intersection, set } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { BlockImageProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentBlockPreview } from '../../admin/content-block/components';
import { parseContentBlocks } from '../../admin/content-block/helpers';
import { ContentPageType } from '../../admin/content/content.types';
import { ContentBlockConfig, ContentBlockType } from '../../admin/shared/types';
import { getUserGroupIds } from '../../authentication/authentication.service';
import { InteractiveTour } from '../../shared/components';
import withUser, { UserProps } from '../../shared/hocs/withUser';

import './ContentPage.scss';

// Because of legacy we have 2 ways of passing content page info
// The preferred way is where we pass the whole Avo.Content.Content object
type ContentPageDetailProps =
	| {
			contentPage: Avo.Content.Content;
	  }
	| {
			// Deprecated
			contentBlockConfigs: ContentBlockConfig[];
			contentWidth: Avo.Content.ContentWidth;
			contentType: ContentPageType | undefined;
			title: string;
	  };

const ContentPage: FunctionComponent<ContentPageDetailProps & UserProps> = props => {
	let contentPage: {
		contentBlockConfigs: ContentBlockConfig[];
		contentWidth: Avo.Content.ContentWidth;
		contentType: ContentPageType;
		title: string;
	};

	if ((props as any).contentPage) {
		contentPage = {
			contentBlockConfigs: parseContentBlocks(
				(props as any).contentPage.contentBlockssBycontentId || []
			),
			contentWidth: (props as any).contentPage.content_width,
			contentType: (props as any).contentPage.content_type,
			title: (props as any).contentPage.title,
		};
	} else {
		contentPage = {
			contentBlockConfigs: (props as any).contentBlockConfigs || [],
			contentWidth: (props as any).contentWidth,
			contentType: (props as any).contentType,
			title: (props as any).title,
		};
	}

	// images can have a setting to go full width
	// so we need to set the block prop: fullWidth to true if we find an image block with size setting: pageWidth
	contentPage.contentBlockConfigs = contentPage.contentBlockConfigs.map(contentBlockConfig => {
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
	});

	// Add page title as header block for faq items
	contentPage.contentBlockConfigs = [
		{
			name: 'Titel',
			type: 'HEADING',
			components: {
				state: {
					children: contentPage.title,
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
		} as ContentBlockConfig,
		...contentPage.contentBlockConfigs,
	];

	const getVisibleContentBlocks = (contentBlockConfigs: ContentBlockConfig[]) => {
		return compact(
			contentBlockConfigs.map(
				(contentBlockConfig: ContentBlockConfig): ContentBlockConfig | null => {
					const blockUserGroupIds: number[] =
						contentBlockConfig.block.state.userGroupIds || [];
					const userGroupIds = getUserGroupIds(props.user);
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
			{getVisibleContentBlocks(contentPage.contentBlockConfigs).map(
				(contentBlockConfig: ContentBlockConfig) => {
					return (
						<ContentBlockPreview
							key={contentBlockConfig.id}
							componentState={contentBlockConfig.components.state}
							contentWidth={contentPage.contentWidth}
							blockState={contentBlockConfig.block.state}
						/>
					);
				}
			)}
		</>
	);
};

export default withUser(ContentPage) as FunctionComponent<ContentPageDetailProps>;
