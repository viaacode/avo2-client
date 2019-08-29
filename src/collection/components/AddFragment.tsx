import { orderBy } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { Button, Container, ToolbarItem } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

interface AddFragmentProps {
	index: number;
	collection: Avo.Collection.Response;
	updateCollection: (collection: Avo.Collection.Response) => void;
	reorderFragments: (fragments: Avo.Collection.Fragment[]) => Avo.Collection.Fragment[];
}

const AddFragment: FunctionComponent<AddFragmentProps> = ({
	index,
	collection,
	updateCollection,
	reorderFragments,
}) => {
	const addFragment = (index: number) => {
		const TEXT_BLOCK_FRAGMENT: Avo.Collection.Fragment = {
			id: -collection.collection_fragments.length,
			position: 1,
			collection_id: collection.id,
			external_id: '',
			custom_description: '',
			custom_title: '',
			updated_at: '',
			created_at: '',
			end_oc: 0,
			start_oc: 0,
			use_custom_fields: false,
		};

		const newFragments = orderBy([...collection.collection_fragments], 'position', 'asc');
		newFragments.splice(index + 1, 0, TEXT_BLOCK_FRAGMENT);

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
						<Button type="secondary" icon="add" onClick={() => addFragment(index)} />
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
