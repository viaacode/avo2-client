import { orderBy } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { FragmentAdd, FragmentEdit } from '../components';
import { FragmentPropertyUpdateInfo } from '../components/modals/CutFragmentModal';

interface CollectionEditContentProps {
	collection: Avo.Collection.Collection;
	swapFragments: (currentId: number, direction: 'up' | 'down') => void;
	updateCollection: (collection: Avo.Collection.Collection) => void;
	updateFragmentProperties: (updateInfo: FragmentPropertyUpdateInfo[]) => void;
}

const CollectionEditContent: FunctionComponent<CollectionEditContentProps> = ({
	collection,
	swapFragments,
	updateCollection,
	updateFragmentProperties,
}) => {
	const [openOptionsId, setOpenOptionsId] = useState<number | null>(null);

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
						<FragmentEdit
							key={`fragment_${fragment.id}`}
							index={index}
							collection={collection}
							swapFragments={swapFragments}
							updateFragmentProperties={updateFragmentProperties}
							openOptionsId={openOptionsId}
							setOpenOptionsId={setOpenOptionsId}
							fragment={fragment}
							reorderFragments={reorderFragments}
							updateCollection={updateCollection}
						/>
					)
				)}
			</Container>
			{!collection.collection_fragments.length && (
				<FragmentAdd
					index={0}
					collection={collection}
					updateCollection={updateCollection}
					reorderFragments={reorderFragments}
				/>
			)}
		</Container>
	);
};

export default CollectionEditContent;
