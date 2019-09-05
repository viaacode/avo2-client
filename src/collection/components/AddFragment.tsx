import { orderBy } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { Button, Container, ToolbarItem } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentBlockType } from '../types';

const COLLECTION_CONTENT_BLOCKS = ['RichText'];

interface AddFragmentProps {
	index: number;
	collection: Avo.Collection.Response;
	updateCollection: (collection: Avo.Collection.Response) => void;
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
		end_oc: 0,
		start_oc: 0,
		use_custom_fields: true,
	},
};

const AddFragment: FunctionComponent<AddFragmentProps> = ({
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

	const addFragment = (index: number, contentBlockType: ContentBlockType) => {
		const newFragments = orderBy([...collection.collection_fragments], 'position', 'asc');

		switch (contentBlockType) {
			case 'RichText':
				newFragments.splice(index + 1, 0, TEXT_BLOCK_FRAGMENT);
				break;
			default:
				// TODO: Could not add fragment because unknown type.
				break;
		}

		const positionedFragments = reorderFragments(newFragments);

		updateCollection({
			...collection,
			collection_fragments: positionedFragments,
			collection_fragment_ids: [
				...(collection.collection_fragment_ids || []),
				TEXT_BLOCK_FRAGMENT.id,
			],
		});
	};

	return (
		<Container>
			<div className="c-toolbar">
				<div className="c-toolbar__justified">
					<div className="c-toolbar__item c-toolbar__item--stretch">
						<div className="c-hr" />
					</div>
					<ToolbarItem>
						{COLLECTION_CONTENT_BLOCKS.length > 1 ? null /* TODO: Dropdown */ : (
							<Button type="secondary" icon="add" onClick={() => addFragment(index, 'RichText')} />
						)}
						<div className="u-sr-accessible">Sectie toevoegen</div>
					</ToolbarItem>
					<div className="c-toolbar__item c-toolbar__item--stretch">
						<div className="c-hr" />
					</div>
				</div>
			</div>
		</Container>
	);
};

export default AddFragment;
