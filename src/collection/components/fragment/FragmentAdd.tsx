import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Container, Toolbar, ToolbarItem } from '@viaa/avo2-components';

import { NEW_FRAGMENT } from '../../collection.const';
import { CollectionAction } from '../CollectionOrBundleEdit';

interface FragmentAddProps {
	index: number;
	collectionId: string;
	numberOfFragments: number;
	changeCollectionState: (action: CollectionAction) => void;
}

const FragmentAdd: FunctionComponent<FragmentAddProps> = ({
	index,
	collectionId,
	numberOfFragments,
	changeCollectionState,
}) => {
	const [t] = useTranslation();

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
						icon="add"
						onClick={handleAddFragmentClick}
						ariaLabel={t(
							'collection/components/fragment/fragment-add___sectie-toevoegen'
						)}
					/>
				</ToolbarItem>
				{renderDivider()}
			</Toolbar>
		</Container>
	);
};

export default FragmentAdd;
