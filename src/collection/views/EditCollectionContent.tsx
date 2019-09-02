import { orderBy } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AddFragment, CollectionFragment } from '../components';

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
						/>
					)
				)}
			</Container>
			{!collection.collection_fragments.length && (
				<AddFragment
					index={0}
					collection={collection}
					updateCollection={updateCollection}
					reorderFragments={reorderFragments}
				/>
			)}
		</Container>
	);
};

export default EditCollectionContent;
