import { orderBy } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { Button, Container, Toolbar, ToolbarItem } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';

import { ContentBlockType } from '../collection.types';

const COLLECTION_CONTENT_BLOCKS = ['RichText'];

interface FragmentAddProps {
	index: number;
	collection: Avo.Collection.Collection;
	updateCollection: (collection: Avo.Collection.Collection) => void;
	reorderFragments: (fragments: Avo.Collection.Fragment[]) => Avo.Collection.Fragment[];
}

const fragmentsDefaults = {
	TEXT: {
		id: null,
		collection_id: null,
		position: 1,
		external_id: '',
		custom_description: '',
		custom_title: '',
		end_oc: null,
		start_oc: null,
		use_custom_fields: true,
	},
};

const FragmentAdd: FunctionComponent<FragmentAddProps> = ({
	index,
	collection,
	updateCollection,
	reorderFragments,
}) => {
	const TEXT_BLOCK_FRAGMENT: any = {
		...fragmentsDefaults.TEXT,
		id: -collection.collection_fragments.length,
		collection_id: collection.id,
	};

	const generateNewFragments = (
		contentBlockType: ContentBlockType
	): Avo.Collection.Fragment[] | null => {
		const newFragments = orderBy([...collection.collection_fragments], 'position', 'asc');

		switch (contentBlockType) {
			case ContentBlockType.RichText:
				newFragments.splice(index + 1, 0, TEXT_BLOCK_FRAGMENT);
				break;
			default:
				toastService(`Het toevoegen van het fragment is mislukt`, TOAST_TYPE.DANGER);
				return null;
		}

		return reorderFragments(newFragments);
	};

	const handleAddFragmentClick = () => {
		const generatedFragments = generateNewFragments(ContentBlockType.RichText);

		if (!generatedFragments) {
			// Failure was handled in generate function
			return;
		}

		updateCollection({
			...collection,
			collection_fragments: generatedFragments,
			collection_fragment_ids: generatedFragments.map(fragment => fragment.id),
		});
	};

	return (
		<Container>
			<Toolbar justify>
				<ToolbarItem grow>
					<div className="c-hr" />
				</ToolbarItem>
				<ToolbarItem>
					{COLLECTION_CONTENT_BLOCKS.length > 1 ? null : (
						<Button
							type="secondary"
							icon="add"
							onClick={handleAddFragmentClick}
							ariaLabel="Sectie toevoegen"
						/>
					)}
				</ToolbarItem>
				<ToolbarItem grow>
					<div className="c-hr" />
				</ToolbarItem>
			</Toolbar>
		</Container>
	);
};

export default FragmentAdd;
