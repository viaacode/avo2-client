import { Alert, Container, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
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
	const [openOptionsId, setOpenOptionsId] = useState<number | string | null>(null);
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

	const collectionFragments = collection.collection_fragments || [];

	// // TODO: DISABLE BELOW UNTIL RETROACTIVE CHANGES EXPLICITLY REQUESTED
	//
	// const byId = (obj: { id?: string | number }, id?: string | number) => `${obj.id}` === id;
	//
	// // The `const`'s below look like they could be easily split into their own components
	// // but they're defined here to remain within the same scope and reduce callback- & passthrough-hell
	//
	// // Render the different titles of each item
	// const listSorterHeading = (item?: ListSorterItem) => {
	// 	const fragment = collectionFragments.find((f) => byId(f, item?.id));
	//
	// 	return fragment && BLOCK_ITEM_LABELS()[fragment?.type];
	// };
	//
	// // Decide what to show inside of each item in the list
	// const listSorterContent = (item?: ListSorterItem) => {
	// 	const fragment = collectionFragments.find((f) => byId(f, item?.id));
	// 	const index = collectionFragments.findIndex((f) => byId(f, item?.id));
	//
	// 	if (fragment) {
	// 		switch (fragment.type) {
	// 			case CollectionBlockType.ITEM:
	// 				return listSorterItemContent(fragment, index);
	//
	// 			case CollectionBlockType.TEXT:
	// 				return listSorterTextContent(fragment, index);
	//
	// 			default:
	// 				return fragment.custom_title || fragment.item_meta?.title;
	// 		}
	// 	}
	// };
	//
	// // Define shared properties for "Title" fields
	// const listSorterItemTitleField = (
	// 	fragment: CollectionFragment,
	// 	index: number
	// ): TitleDescriptionFormTitleField | CustomiseItemFormTitleField => ({
	// 	label: t('collection/components/fragment/fragment-edit___tekstblok-titel'),
	// 	placeholder: t(
	// 		'collection/components/fragment/fragment-edit___geef-hier-de-titel-van-je-tekstblok-in'
	// 	),
	// 	onChange: (value) =>
	// 		value !== fragment.custom_title &&
	// 		changeCollectionState({
	// 			index,
	// 			fragmentProp: 'custom_title',
	// 			fragmentPropValue: value,
	// 			type: 'UPDATE_FRAGMENT_PROP',
	// 		}),
	// });
	//
	// // Define shared properties for "Description" fields
	// const listSorterItemDescriptionField = (
	// 	fragment: CollectionFragment,
	// 	index: number
	// ): TitleDescriptionFormDescriptionField | CustomiseItemFormDescriptionField => ({
	// 	controls: allowedToAddLinks ? WYSIWYG_OPTIONS_AUTHOR : WYSIWYG_OPTIONS_DEFAULT,
	// 	label: t('collection/components/fragment/fragment-edit___tekstblok-beschrijving'),
	// 	placeholder: t(
	// 		'collection/components/fragment/fragment-edit___geef-hier-de-inhoud-van-je-tekstblok-in'
	// 	),
	// 	onChange: (value) =>
	// 		value.toHTML() !== fragment.custom_description &&
	// 		changeCollectionState({
	// 			index,
	// 			fragmentProp: 'custom_description',
	// 			fragmentPropValue: value.toHTML(),
	// 			type: 'UPDATE_FRAGMENT_PROP',
	// 		}),
	// });
	//
	// // Render the content of an "ITEM"-type list item
	// const listSorterItemContent = (fragment: CollectionFragment, index: number) => (
	// 	<CustomiseItemForm
	// 		className="u-padding-l"
	// 		id={fragment.id}
	// 		preview={() => {
	// 			if (fragment.item_meta) {
	// 				const meta = fragment.item_meta as ItemSchema;
	//
	// 				return (
	// 					<FlowPlayerWrapper
	// 						item={meta}
	// 						poster={fragment.thumbnail_path || meta.thumbnail_path}
	// 						external_id={meta.external_id}
	// 						duration={meta.duration}
	// 						title={meta.title}
	// 						cuePoints={{
	// 							start: fragment.start_oc,
	// 							end: fragment.end_oc,
	// 						}}
	// 						// canPlay={
	// 						// 	!isCutModalOpen &&
	// 						// 	!isDeleteModalOpen
	// 						// }
	// 					/>
	// 				);
	// 			}
	//
	// 			return null;
	// 		}}
	// 		toggle={{
	// 			label: t('collection/components/fragment/fragment-edit___alternatieve-tekst'),
	// 			checked: fragment.use_custom_fields,
	// 			onChange: (value) =>
	// 				changeCollectionState({
	// 					index,
	// 					fragmentProp: 'use_custom_fields',
	// 					fragmentPropValue: value,
	// 					type: 'UPDATE_FRAGMENT_PROP',
	// 				}),
	// 		}}
	// 		title={{
	// 			...listSorterItemTitleField(fragment, index),
	// 			disabled: !fragment.use_custom_fields,
	// 			value:
	// 				(fragment.use_custom_fields
	// 					? fragment.custom_title
	// 					: fragment.item_meta?.title) || undefined,
	// 		}}
	// 		description={{
	// 			...listSorterItemDescriptionField(fragment, index),
	// 			disabled: !fragment.use_custom_fields,
	// 			initialHtml: convertToHtml(
	// 				fragment.use_custom_fields
	// 					? fragment.custom_description
	// 					: fragment.item_meta?.description
	// 			),
	// 		}}
	// 	/>
	// );
	//
	// // Render the content of a "TEXT"-type list item
	// const listSorterTextContent = (fragment: CollectionFragment, index: number) => (
	// 	<TitleDescriptionForm
	// 		className="u-padding-l"
	// 		id={fragment.id}
	// 		title={{
	// 			...listSorterItemTitleField(fragment, index),
	// 			value: fragment.custom_title || undefined,
	// 		}}
	// 		description={{
	// 			...listSorterItemDescriptionField(fragment, index),
	// 			initialHtml: convertToHtml(fragment.custom_description),
	// 		}}
	// 	/>
	// );
	//
	// // Render the divider between each list item
	// const listSorterDivider = (item?: ListSorterItem) => {
	// 	const index = collectionFragments.findIndex((f) => byId(f, item?.id));
	//
	// 	return (
	// 		<Button
	// 			type="secondary"
	// 			icon="plus"
	// 			onClick={() =>
	// 				changeCollectionState({
	// 					type: 'INSERT_FRAGMENT',
	// 					index: index + 1,
	// 					fragment: {
	// 						...NEW_FRAGMENT.text,
	// 						id: new Date().valueOf(),
	// 						collection_uuid: collection.id,
	// 					} as unknown as Avo.Collection.Fragment,
	// 				})
	// 			}
	// 		/>
	// 	);
	// };
	//
	// // Map a CollectionFragment to a ListSorterItem
	// const listSorterItem = (fragment: CollectionFragment, i: number) => {
	// 	const mapped: ListSorterItem = {
	// 		id: `${fragment.id}`,
	// 		position: fragment.position,
	// 		icon: BLOCK_ITEM_ICONS()[fragment.type](fragment),
	//
	// 		onPositionChange: (_item, delta) => {
	// 			changeCollectionState({
	// 				direction: delta > 0 ? 'down' : 'up',
	// 				index: i,
	// 				type: 'SWAP_FRAGMENTS',
	// 			});
	// 		},
	//
	// 		onSlice: (item) => {
	// 			const index = collectionFragments.findIndex(
	// 				(fragment) => `${fragment.id}` === item.id
	// 			);
	//
	// 			changeCollectionState({
	// 				index,
	// 				type: 'DELETE_FRAGMENT',
	// 			});
	// 		},
	// 	};
	//
	// 	return mapped;
	// };
	//
	// // TODO: DISABLE ABOVE UNTIL RETROACTIVE CHANGES EXPLICITLY REQUESTED

	if (isNil(allowedToAddLinks)) {
		return null;
	}

	return (
		<Container mode="vertical" className="m-collection-or-bundle-edit-content">
			{/*/!* TODO: DISABLE BELOW UNTIL RETROACTIVE CHANGES EXPLICITLY REQUESTED *!/*/}

			{/*<Container mode="horizontal">*/}
			{/*	<ListSorter*/}
			{/*		heading={listSorterHeading}*/}
			{/*		content={listSorterContent}*/}
			{/*		divider={listSorterDivider}*/}
			{/*		items={collectionFragments.map(listSorterItem)}*/}
			{/*	/>*/}
			{/*</Container>*/}

			{/*<br />*/}
			{/*<hr />*/}
			{/*<br />*/}

			{/*/!* TODO: DISABLE ABOVE UNTIL RETROACTIVE CHANGES EXPLICITLY REQUESTED *!/*/}

			<Container mode="horizontal" key={collectionFragments.map(getFragmentKey).join('_')}>
				{isCollection && (
					<FragmentAdd
						index={-1}
						collectionId={collection.id}
						numberOfFragments={collectionFragments.length}
						changeCollectionState={changeCollectionState}
					/>
				)}

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
						isParentACollection={isCollection}
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
		</Container>
	);
};

export default React.memo(CollectionOrBundleEditContent);
