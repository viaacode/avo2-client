import { cloneDeep, compact, intersection, set } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { BlockImageProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentBlockPreview } from '../../admin/content-block/components';
import { parseContentBlocks } from '../../admin/content-block/helpers';
import { ContentBlockConfig, ContentBlockType } from '../../admin/shared/types';
import { getUserGroupIds } from '../../authentication/authentication.service';
import { InteractiveTour } from '../../shared/components';
import withUser, { UserProps } from '../../shared/hocs/withUser';

import './ContentPage.scss';

type ContentPageDetailProps =
	| {
			contentPage: Avo.Content.Content;
	  }
	| {
			contentBlockConfigs: ContentBlockConfig[];
			contentWidth: Avo.Content.ContentWidth;
	  };

const ContentPage: FunctionComponent<ContentPageDetailProps & UserProps> = props => {
	let contentBlockConfigs: ContentBlockConfig[];
	let contentWidth: Avo.Content.ContentWidth;
	if ((props as any).contentPage) {
		contentBlockConfigs = parseContentBlocks(
			(props as any).contentPage.contentBlockssBycontentId || []
		);
		contentWidth = (props as any).contentPage.content_width;
	} else {
		contentBlockConfigs = (props as any).contentBlockConfigs || [];
		contentWidth = (props as any).contentWidth;
	}

	// images can have a setting to go full width
	// so we need to set the block prop: fullWidth to true if we find an image block with size setting: pageWidth
	contentBlockConfigs = contentBlockConfigs.map(contentBlockConfig => {
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
			{getVisibleContentBlocks(contentBlockConfigs).map(
				(contentBlockConfig: ContentBlockConfig) => {
					return (
						<ContentBlockPreview
							key={contentBlockConfig.id}
							componentState={contentBlockConfig.components.state}
							contentWidth={contentWidth}
							blockState={contentBlockConfig.block.state}
						/>
					);
				}
			)}
		</>
	);
};

export default withUser(ContentPage) as FunctionComponent<ContentPageDetailProps>;
