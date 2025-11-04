import { Button, Container, IconName, Toolbar, ToolbarItem } from '@viaa/avo2-components';
import React, { type FC } from 'react';

import { tText } from '../../../shared/helpers/translate-text';
import { NEW_FRAGMENT } from '../../collection.const';
import { type CollectionAction } from '../CollectionOrBundleEdit.types';

interface FragmentAddProps {
	index: number;
	collectionId: string;
	numberOfFragments: number;
	changeCollectionState: (action: CollectionAction) => void;
}

export const FragmentAdd: FC<FragmentAddProps> = ({
	index,
	collectionId,
	numberOfFragments,
	changeCollectionState,
}) => {
	const TEXT_BLOCK_FRAGMENT: any = {
		...NEW_FRAGMENT.text,
		id: -numberOfFragments,
		collection_uuid: collectionId,
	};

	// Listeners
	const handleAddFragmentClick = () => {
		changeCollectionState({
			type: 'INSERT_FRAGMENT',
			index: index + 1,
			fragment: TEXT_BLOCK_FRAGMENT,
		});
	};

	// Render methods
	const renderDivider = () => (
		<ToolbarItem grow>
			<div className="c-hr" />
		</ToolbarItem>
	);

	return (
		<Container>
			<Toolbar justify>
				{renderDivider()}
				<ToolbarItem>
					<Button
						type="secondary"
						icon={IconName.add}
						onClick={handleAddFragmentClick}
						ariaLabel={tText(
							'collection/components/fragment/fragment-add___sectie-toevoegen'
						)}
						title={tText(
							'collection/components/fragment/fragment-add___sectie-toevoegen'
						)}
					/>
				</ToolbarItem>
				{renderDivider()}
			</Toolbar>
		</Container>
	);
};
