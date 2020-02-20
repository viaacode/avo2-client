import { orderBy } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';

import { FragmentAdd, FragmentEdit } from '../components';
import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditContentProps extends DefaultSecureRouteProps {
	type: 'collection' | 'bundle';
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
}

const CollectionOrBundleEditContent: FunctionComponent<CollectionOrBundleEditContentProps> = ({
	type,
	collection,
	changeCollectionState,
	...rest
}) => {
	// State
	const [openOptionsId, setOpenOptionsId] = useState<number | null>(null);

	const isCollection = type === 'collection';

	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				{orderBy(collection.collection_fragments, ['position'], ['asc']).map(
					(fragment: Avo.Collection.Fragment, index: number) => (
						<FragmentEdit
							// If the parent is a collection then the fragment is an ITEM or TEXT
							// If the parent is a bundle then the fragment is a COLLECTION
							type={isCollection ? 'itemOrText' : 'collection'}
							key={`fragment_${fragment.id}-${fragment.position}`}
							index={index}
							collection={collection}
							changeCollectionState={changeCollectionState}
							openOptionsId={openOptionsId}
							setOpenOptionsId={setOpenOptionsId}
							fragment={fragment}
							{...rest}
						/>
					)
				)}
			</Container>
			{!collection.collection_fragments.length && isCollection && (
				<FragmentAdd
					index={0}
					collection={collection}
					changeCollectionState={changeCollectionState}
				/>
			)}
		</Container>
	);
};

export default CollectionOrBundleEditContent;
