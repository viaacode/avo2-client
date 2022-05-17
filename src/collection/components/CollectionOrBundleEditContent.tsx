import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Container, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { BlockEditor, BlockType } from '../../shared/components/BlockEditor/BlockEditor';
import { ToastService } from '../../shared/services';
import { FragmentAdd, FragmentEdit } from '../components';
import { showReplacementWarning } from '../helpers/fragment';

import { CollectionAction } from './CollectionOrBundleEdit';
import './CollectionOrBundleEditContent.scss';

interface CollectionOrBundleEditContentProps extends DefaultSecureRouteProps {
	type: 'collection' | 'bundle';
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
}

const CollectionOrBundleEditContent: FunctionComponent<CollectionOrBundleEditContentProps> = ({
	type,
	collection,
	changeCollectionState,
	user,
}) => {
	const [t] = useTranslation();

	// State
	const [openOptionsId, setOpenOptionsId] = useState<number | null>(null);
	const [allowedToAddLinks, setAllowedToAddLinks] = useState<boolean | null>(null);

	const isCollection = type === 'collection';

	useEffect(() => {
		PermissionService.hasPermission(PermissionName.ADD_HYPERLINK_COLLECTIONS, null, user)
			.then((hasPermission) => {
				setAllowedToAddLinks(hasPermission);
			})
			.catch((err) => {
				console.error(
					'Failed to check permissions for adding hyperlinks in collection fragment editors',
					err,
					{ user, permission: PermissionName.ADD_HYPERLINK_COLLECTIONS }
				);
				ToastService.danger(
					t(
						'collection/components/fragment/fragment-edit___het-controleren-van-je-account-rechten-is-mislukt'
					)
				);
			});
	}, [user, t]);

	const getFragmentKey = (fragment: Avo.Collection.Fragment) => {
		return `fragment_${fragment.id}-${get(fragment, 'created_at')}-${get(
			fragment,
			'position'
		)}`;
	};

	if (isNil(allowedToAddLinks)) {
		return null;
	}
	const collectionFragments = collection.collection_fragments || [];

	// TODO: DISABLE BELOW UNTIL RETROACTIVE CHANGES EXPLICITLY REQUESTED

	const handlePositionChange = (delta: number, index: number) => {
		changeCollectionState({
			index,
			direction: delta > 0 ? 'down' : 'up',
			type: 'SWAP_FRAGMENTS',
		});
	};

	const handleDelete = (index: number) => {
		changeCollectionState({
			index,
			type: 'DELETE_FRAGMENT',
		});
	};

	// TODO: DISABLE ABOVE UNTIL RETROACTIVE CHANGES EXPLICITLY REQUESTED

	return (
		<Container mode="vertical" className="m-collection-or-bundle-edit-content">
			{/* TODO: DISABLE BELOW UNTIL RETROACTIVE CHANGES EXPLICITLY REQUESTED */}

			<Container mode="horizontal">
				<BlockEditor
					blocks={collectionFragments.map((fragment, i) => {
						let type: BlockType = BlockType.Item;

						switch (fragment.type) {
							case 'COLLECTION':
								type = BlockType.Collection;
								break;

							case 'ITEM':
								type = BlockType.Item;
								break;

							case 'TEXT':
								type = BlockType.Text;
								break;

							default:
								break;
						}

						return {
							type,
							description: fragment.custom_description || undefined,
							id: `${fragment.id}`,
							/* tslint-disable-next-line variable-name */
							onPositionChange: (_block, delta) => {
								handlePositionChange(delta, i);
							},
							onDelete: (block) => {
								handleDelete(
									collectionFragments.findIndex(
										(fragment) => `${fragment.id}` === block.id
									)
								);
							},
							position: fragment.position,
							title: fragment.custom_title || undefined,
						};
					})}
				></BlockEditor>
			</Container>

			<br />
			<hr />
			<br />

			{/* TODO: DISABLE ABOVE UNTIL RETROACTIVE CHANGES EXPLICITLY REQUESTED */}

			<Container mode="horizontal" key={collectionFragments.map(getFragmentKey).join('_')}>
				{collectionFragments.map((fragment: Avo.Collection.Fragment, index: number) => (
					<FragmentEdit
						// If the parent is a collection then the fragment is an ITEM or TEXT
						// If the parent is a bundle then the fragment is a COLLECTION
						key={getFragmentKey(fragment)}
						index={index}
						collectionId={collection.id}
						numberOfFragments={collectionFragments.length}
						changeCollectionState={changeCollectionState}
						openOptionsId={openOptionsId}
						setOpenOptionsId={setOpenOptionsId}
						fragment={fragment}
						allowedToAddLinks={allowedToAddLinks as boolean}
						renderWarning={() => {
							if (showReplacementWarning(collection, fragment, user)) {
								return (
									<Spacer margin="bottom">
										<Alert type="danger">
											{t(
												'collection/components/fragment/fragment-list___dit-item-is-recent-vervangen-door-een-nieuwe-versie-je-controleert-best-of-je-knippunten-nog-correct-zijn'
											)}
										</Alert>
									</Spacer>
								);
							}
							return null;
						}}
					/>
				))}
			</Container>

			{!collectionFragments.length && isCollection && (
				<FragmentAdd
					index={0}
					collectionId={collection.id}
					numberOfFragments={collectionFragments.length}
					changeCollectionState={changeCollectionState}
				/>
			)}
		</Container>
	);
};

export default React.memo(CollectionOrBundleEditContent);
