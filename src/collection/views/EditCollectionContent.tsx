import { orderBy } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Button, Container, ToolbarItem } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import CollectionFragment from '../components/CollectionFragment';

interface EditCollectionContentProps {
	collection: Avo.Collection.Response;
	swapFragments: (currentId: number, direction: 'up' | 'down') => void;
	updateCollection: (collection: Avo.Collection.Response) => void;
	updateFragmentProperty: (value: string, fieldName: string, fragmentId: number) => void;
}

const EditCollectionContent: FunctionComponent<EditCollectionContentProps> = ({
	collection,
	swapFragments,
	updateCollection,
	updateFragmentProperty,
}) => {
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(null);

	const reorderFragments = (fragments: Avo.Collection.Fragment[]) => {
		return fragments.map((fragment: Avo.Collection.Fragment, index: number) => ({
			...fragment,
			position: index + 1,
		}));
	};

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
		<Container mode="vertical">
			<Container mode="horizontal">
				{orderBy(collection.collection_fragments, ['position'], ['asc']).map(
					(fragment: any, index: number) => (
						<CollectionFragment
							key={`fragment_${index}`}
							index={index}
							collection={collection}
							swapFragments={swapFragments}
							updateFragmentProperty={updateFragmentProperty}
							isOptionsMenuOpen={isOptionsMenuOpen}
							setIsOptionsMenuOpen={setIsOptionsMenuOpen}
							fragment={fragment}
							reorderFragments={reorderFragments}
							updateCollection={updateCollection}
							addFragment={addFragment}
						/>
					)
				)}
			</Container>
			{!collection.collection_fragments.length && (
				<Container mode="horizontal">
					<Container>
						<div className="c-toolbar">
							<div className="c-toolbar__justified">
								<div className="c-toolbar__item c-toolbar__item--stretch">
									<div className="c-hr" />
								</div>
								<ToolbarItem>
									<Button type="secondary" icon="add" onClick={() => addFragment(0)} />
									<div className="u-sr-accessible">Sectie toevoegen</div>
								</ToolbarItem>
								<div className="c-toolbar__item c-toolbar__item--stretch">
									<div className="c-hr" />
								</div>
							</div>
						</div>
					</Container>
				</Container>
			)}
		</Container>
	);
};

export default EditCollectionContent;
