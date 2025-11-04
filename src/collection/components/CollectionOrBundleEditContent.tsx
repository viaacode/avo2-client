import { BlockHeading } from '@meemoo/admin-core-ui/client';
import { Alert, Container, Icon, IconName, Spacer } from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { get, isNil } from 'lodash-es';
import React, { type FC, type ReactNode, useEffect, useState } from 'react';

import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { ToastService } from '../../shared/services/toast-service';
import { type CollectionOrBundle } from '../collection.types';
import FragmentEdit from '../components/fragment/FragmentEdit';
import { showReplacementWarning } from '../helpers/fragment';

import { type CollectionAction } from './CollectionOrBundleEdit.types';
import { COLLECTION_SAVE_DELAY } from './CollectionOrBundleEditContent.consts';
import { FragmentAdd } from './fragment/FragmentAdd';

import './CollectionOrBundleEditContent.scss';

interface CollectionOrBundleEditContentProps {
	type: CollectionOrBundle;
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	onFocus?: () => void;
}

export const CollectionOrBundleEditContent: FC<CollectionOrBundleEditContentProps> = ({
	type,
	collection,
	changeCollectionState,
	onFocus,
}) => {
	const commonUser = useAtomValue(commonUserAtom);

	// State
	const [openOptionsId, setOpenOptionsId] = useState<number | string | null>(null);
	const [allowedToAddLinks, setAllowedToAddLinks] = useState<boolean | null>(null);

	// Computed
	const isCollection = type === 'collection';
	const fragments = collection.collection_fragments || [];
	const fragmentCollections = fragments.filter((f) => f.type === 'COLLECTION');
	const fragmentAssignments = fragments.filter((f) => f.type === 'ASSIGNMENT');

	useEffect(() => {
		PermissionService.hasPermission(PermissionName.ADD_HYPERLINK_COLLECTIONS, null, commonUser)
			.then((hasPermission) => {
				setAllowedToAddLinks(hasPermission);
			})
			.catch((err) => {
				console.error(
					'Failed to check permissions for adding hyperlinks in collection fragment editors',
					err,
					{ commonUser, permission: PermissionName.ADD_HYPERLINK_COLLECTIONS }
				);
				ToastService.danger(
					tHtml(
						'collection/components/fragment/fragment-edit___het-controleren-van-je-account-rechten-is-mislukt'
					)
				);
			});
	}, [commonUser]);

	const getFragmentKey = (fragment: Avo.Collection.Fragment) => {
		return `fragment_${fragment.id}-${get(fragment, 'created_at')}-${get(
			fragment,
			'position'
		)}`;
	};

	const handleChangedCollectionState = (action: CollectionAction, startIndex: number) => {
		if (
			action.type === 'INSERT_FRAGMENT' ||
			action.type === 'UPDATE_FRAGMENT_PROP' ||
			action.type === 'SWAP_FRAGMENTS' ||
			action.type === 'DELETE_FRAGMENT'
		) {
			// We need to map the indexes back to the original indexes in the collection/bundle
			// Since we have 2 lists of fragments in a bundle (collections and assignments)
			action.index = startIndex + action.index;
			if (
				action.type === 'INSERT_FRAGMENT' ||
				action.type === 'SWAP_FRAGMENTS' ||
				action.type === 'DELETE_FRAGMENT'
			) {
				// Need to delay this action, otherwise the current rich text editor status will be lost, since it updates asynchronous on blur
				// https://meemoo.atlassian.net/browse/AVO-3370
				// https://meemoo.atlassian.net/browse/AVO-3573
				// User clicked inside the fragment edit component
				// Do not update the parent state
				// So the video playback will not be reset
				setTimeout(() => {
					changeCollectionState(action);
				}, COLLECTION_SAVE_DELAY);
			} else {
				changeCollectionState(action);
			}
		}
	};

	const renderFragmentEditor = (
		fragment: Avo.Collection.Fragment,
		index: number,
		startIndex: number,
		endIndex: number
	): ReactNode => {
		return (
			<FragmentEdit
				// If the parent is a collection then the fragment is an ITEM or TEXT
				// If the parent is a bundle then the fragment is a COLLECTION or ASSIGNMENT
				key={getFragmentKey(fragment)}
				index={index}
				collectionId={collection.id}
				numberOfFragments={endIndex - startIndex}
				changeCollectionState={(action: CollectionAction) =>
					handleChangedCollectionState(action, startIndex)
				}
				openOptionsId={openOptionsId}
				setOpenOptionsId={setOpenOptionsId}
				isParentACollection={isCollection}
				fragment={fragment}
				allowedToAddLinks={allowedToAddLinks as boolean}
				renderWarning={() => {
					if (showReplacementWarning(collection, fragment, commonUser?.profileId)) {
						return (
							<Spacer margin="bottom">
								<Alert type="danger">
									{tText(
										'collection/components/fragment/fragment-list___dit-item-is-recent-vervangen-door-een-nieuwe-versie-je-controleert-best-of-je-knippunten-nog-correct-zijn'
									)}
								</Alert>
							</Spacer>
						);
					}
					return null;
				}}
				onFocus={onFocus}
			/>
		);
	};

	const renderFragmentEditors = () => {
		if (isCollection) {
			// Render collection fragments: items and texts
			return (
				<>
					<FragmentAdd
						index={-1}
						collectionId={collection.id}
						numberOfFragments={fragments.length}
						changeCollectionState={(action: CollectionAction) =>
							handleChangedCollectionState(action, 0)
						}
					/>
					{fragments.map((fragment, index) =>
						renderFragmentEditor(fragment, index, 0, fragments.length)
					)}
				</>
			);
		} else {
			// Render bundle fragments: collections and assignments
			return (
				<>
					{/* Do not show any collections title if no collections in the bundle */}
					{fragmentCollections.length > 0 && (
						<>
							{/* Only show title if also assignments are present */}
							{fragmentAssignments.length > 0 && (
								<BlockHeading
									type="h3"
									className="u-spacer-top-xl u-spacer-bottom-l"
								>
									<Icon
										name={IconName.collection}
										className="u-spacer-right-s u-spacer-bottom-xs u-color-ocean-green"
									/>
									{tHtml(
										'collection/components/collection-or-bundle-edit-content___collecties-in-deze-bundel'
									)}
								</BlockHeading>
							)}
							{fragmentCollections.map((fragment, index) =>
								renderFragmentEditor(fragment, index, 0, fragmentCollections.length)
							)}
						</>
					)}

					{/* Do not show any assignments title if no assignments in the bundle */}
					{fragmentAssignments.length > 0 && (
						<>
							{/* Only show title if also collections are present */}
							{fragmentCollections.length > 0 && (
								<BlockHeading
									type="h3"
									className="u-spacer-top-xl u-spacer-bottom-l"
								>
									<Icon
										name={IconName.clipboard}
										className="u-spacer-right-s u-spacer-bottom-xs u-color-french-rose"
									/>
									{tHtml(
										'collection/components/collection-or-bundle-edit-content___opdrachten-in-deze-bundel'
									)}
								</BlockHeading>
							)}
							{fragmentAssignments.map((fragment, index) =>
								renderFragmentEditor(
									fragment,
									index,
									fragmentCollections.length,
									fragmentCollections.length + fragmentAssignments.length
								)
							)}
						</>
					)}
				</>
			);
		}
	};

	if (isNil(allowedToAddLinks)) {
		return null;
	}

	return (
		<Container mode="vertical" className="m-collection-or-bundle-edit-content">
			<Container mode="horizontal" key={fragments.map(getFragmentKey).join('_')}>
				{renderFragmentEditors()}
			</Container>
		</Container>
	);
};
