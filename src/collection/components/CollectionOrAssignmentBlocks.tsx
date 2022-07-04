import { Container } from '@viaa/avo2-components';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { CollectionFragment } from '@viaa/avo2-types/types/collection';
import React, { FC, ReactNode } from 'react';

import { IconBar } from '../../shared/components';
import { COLLECTION_OR_ASSIGNMENT_BLOCK_ICONS, CollectionBlockType } from '../collection.const';

import { CollectionFragmentTypeItem, CollectionFragmentTypeText } from './index';

interface CollectionOrFragmentBlocksProps {
	blocks: CollectionFragment[] | AssignmentBlock[];
	canPlay: boolean;
	enableContentLinks: boolean;
}

const CollectionOrAssignmentBlocks: FC<CollectionOrFragmentBlocksProps> = ({
	blocks,
	canPlay,
	enableContentLinks,
}) => {
	const renderCollectionFragment = (fragment: CollectionFragment | AssignmentBlock) => {
		const layout = (children?: ReactNode) => (
			<Container mode="horizontal" className="u-p-0">
				<IconBar
					icon={{
						name: COLLECTION_OR_ASSIGNMENT_BLOCK_ICONS()[fragment.type](fragment),
					}}
				>
					{children}
				</IconBar>
			</Container>
		);

		switch (fragment.type) {
			case CollectionBlockType.TEXT:
				return layout(
					<CollectionFragmentTypeText
						title={{ fragment }}
						richText={{ fragment }}
						enableContentLinks={enableContentLinks}
					/>
				);
			case CollectionBlockType.ITEM:
				return layout(
					<CollectionFragmentTypeItem
						className="m-collection-detail__video-content"
						title={{
							fragment,
						}}
						richText={{ fragment }}
						flowPlayer={{
							fragment,
							canPlay,
						}}
						meta={{ fragment, enableContentLinks }}
						enableContentLinks={enableContentLinks}
					/>
				);

			default:
				return null;
		}
	};

	const renderCollectionFragmentWrapper = (fragment: CollectionFragment | AssignmentBlock) => {
		return (
			<div key={fragment.id} className="u-padding-top-l u-padding-bottom-l">
				{renderCollectionFragment(fragment)}
			</div>
		);
	};

	return <>{blocks.map(renderCollectionFragmentWrapper)}</>;
};

export default CollectionOrAssignmentBlocks;
