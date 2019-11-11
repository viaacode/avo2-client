import { orderBy } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { Button, Container, Toolbar, ToolbarItem } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { NEW_FRAGMENT } from '../../collection.const';

const COLLECTION_CONTENT_BLOCKS = ['RichText'];

interface FragmentAddProps {
	index: number;
	collection: Avo.Collection.Collection;
	updateCollection: (collection: Avo.Collection.Collection) => void;
	reorderFragments: (fragments: Avo.Collection.Fragment[]) => Avo.Collection.Fragment[];
}

const FragmentAdd: FunctionComponent<FragmentAddProps> = ({
	index,
	collection,
	updateCollection,
	reorderFragments,
}) => {
	const { collection_fragments, id } = collection;
	const TEXT_BLOCK_FRAGMENT: any = {
		...NEW_FRAGMENT.text,
		id: -collection_fragments.length,
		collection_id: id,
	};

	const addFragment = (index: number) => {
		const newFragments = orderBy([...collection_fragments], 'position', 'asc');

		newFragments.splice(index + 1, 0, TEXT_BLOCK_FRAGMENT);

		const positionedFragments = reorderFragments(newFragments);

		updateCollection({
			...collection,
			collection_fragments: positionedFragments,
			collection_fragment_ids: positionedFragments.map(({ id }) => id),
		});
	};

	return (
		<Container>
			<Toolbar justify>
				<ToolbarItem grow>
					<div className="c-hr" />
				</ToolbarItem>
				<ToolbarItem>
					<Button
						type="secondary"
						icon="add"
						onClick={() => addFragment(index)}
						ariaLabel="Sectie toevoegen"
					/>
				</ToolbarItem>
				<ToolbarItem grow>
					<div className="c-hr" />
				</ToolbarItem>
			</Toolbar>
		</Container>
	);
};

export default FragmentAdd;
