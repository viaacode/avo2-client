import { orderBy } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';

import { FragmentPropertyUpdateInfo } from '../collection.types';
import { FragmentAdd, FragmentEdit } from '../components';

interface CollectionOrBundleEditContentProps extends DefaultSecureRouteProps {
	type: 'collection' | 'bundle';
	collection: Avo.Collection.Collection;
	swapFragments: (currentId: number, direction: 'up' | 'down') => void;
	updateCollection: (collection: Avo.Collection.Collection) => void;
	updateFragmentProperties: (updateInfo: FragmentPropertyUpdateInfo[]) => void;
}

const CollectionOrBundleEditContent: FunctionComponent<CollectionOrBundleEditContentProps> = ({
	type,
	collection,
	swapFragments,
	updateCollection,
	updateFragmentProperties,
	...rest
}) => {
	// State
	const [openOptionsId, setOpenOptionsId] = useState<number | null>(null);

	const isCollection = type === 'collection';

	const reorderFragments = (fragments: Avo.Collection.Fragment[]) =>
		fragments.map((fragment: Avo.Collection.Fragment, index: number) => ({
			...fragment,
			position: index + 1,
		}));

	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				{orderBy(collection.collection_fragments, ['position'], ['asc']).map(
					(fragment: Avo.Collection.Fragment, index: number) => (
						<FragmentEdit
							// If the parent is a collection then the fragment is an ITEM or TEXT
							// If the parent is a bundle then the fragment is a COLLECTION
							type={isCollection ? 'itemOrText' : 'collection'}
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
							{...rest}
						/>
					)
				)}
			</Container>
			{!collection.collection_fragments.length && isCollection && (
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

export default CollectionOrBundleEditContent;
