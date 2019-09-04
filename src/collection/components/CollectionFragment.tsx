import { get, orderBy } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { withApollo } from 'react-apollo';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	Column,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Grid,
	MenuContent,
	TextInput,
	Thumbnail,
	Toggle,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	WYSIWYG,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';

import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { GET_ITEM_META_BY_EXTERNAL_ID } from '../collection.gql';
import AddFragment from './AddFragment';

interface CollectionFragmentProps extends RouteComponentProps {
	index: number;
	collection: Avo.Collection.Response;
	swapFragments: (currentId: number, direction: 'up' | 'down') => void;
	updateFragmentProperty: (value: any, fieldName: string, fragmentId: number) => void;
	isOptionsMenuOpen: string | null;
	setIsOptionsMenuOpen: React.Dispatch<React.SetStateAction<null>>;
	fragment: any;
	reorderFragments: (fragments: Avo.Collection.Fragment[]) => Avo.Collection.Fragment[];
	updateCollection: (collection: Avo.Collection.Response) => void;
}

const CollectionFragment: FunctionComponent<CollectionFragmentProps> = ({
	index,
	collection,
	swapFragments,
	updateFragmentProperty,
	isOptionsMenuOpen,
	setIsOptionsMenuOpen,
	fragment,
	reorderFragments,
	updateCollection,
}) => {
	const [useCustomFields, setUseCustomFields] = useState(fragment.use_custom_fields);

	// Check whether the current fragment is the first and/or last fragment in collection
	const isFirst = (index: number) => index === 0;
	const isLast = (index: number) => index === collection.collection_fragments.length - 1;

	// Render methods
	const renderReorderButton = (fragmentId: number, direction: 'up' | 'down') => (
		<Button
			type="secondary"
			icon={`chevron-${direction}`}
			onClick={() => swapFragments(fragmentId, direction)}
		/>
	);

	const onChangeToggle = () => {
		updateFragmentProperty(!useCustomFields, 'use_custom_fields', fragment.id);
		setUseCustomFields(!useCustomFields);
	};

	const renderForm = (fragment: any, itemMeta: any, index: number) => {
		const onChangeTitle = (value: string) => {
			if (itemMeta && !useCustomFields) {
				return null;
			}

			return updateFragmentProperty(value, 'custom_title', fragment.id);
		};

		const onChangeDescription = (e: any) => {
			if (itemMeta && !useCustomFields) {
				return null;
			}

			return updateFragmentProperty(e.target.innerHTML, 'custom_description', fragment.id);
		};

		const getFragmentProperty = (
			itemMeta: any,
			fragment: any,
			useCustomFields: Boolean,
			prop: 'title' | 'description'
		) => {
			if (useCustomFields) {
				return get(fragment, `custom_${prop}`) || get(itemMeta, prop, '');
			}
			return get(itemMeta, prop, '');
		};

		return (
			<Form>
				{itemMeta && (
					<FormGroup label="Alternatieve Tekst" labelFor="customFields">
						<Toggle id="customFields" checked={useCustomFields} onChange={onChangeToggle} />
					</FormGroup>
				)}
				<FormGroup label={`Tekstblok titel`} labelFor="title">
					<TextInput
						id="title"
						type="text"
						value={getFragmentProperty(itemMeta, fragment, useCustomFields, 'title')}
						placeholder="Titel"
						onChange={onChangeTitle}
						disabled={!useCustomFields && itemMeta}
					/>
				</FormGroup>
				<FormGroup label="Tekstblok beschrijving" labelFor={`beschrijving_${index}`}>
					<WYSIWYG
						id={`beschrijving_${index}`}
						data={getFragmentProperty(itemMeta, fragment, useCustomFields, 'description')}
						onChange={onChangeDescription}
						disabled={!useCustomFields && itemMeta}
					/>
				</FormGroup>
			</Form>
		);
	};

	const onDuplicateFragment = (fragmentId: number) => {
		setIsOptionsMenuOpen(null);
		toastService('Fragment is succesvol gedupliceerd', TOAST_TYPE.SUCCESS);
	};

	const onMoveFragment = () => {
		setIsOptionsMenuOpen(null);
		toastService('Fragment is succesvol verplaatst', TOAST_TYPE.SUCCESS);
	};

	const onCopyFragmentToCollection = () => {
		setIsOptionsMenuOpen(null);
		toastService('Fragment is succesvol gekopiëerd naar collectie', TOAST_TYPE.SUCCESS);
	};

	const onMoveFragmentToCollection = () => {
		setIsOptionsMenuOpen(null);
		toastService('Fragment is succesvol verplaatst naar collectie', TOAST_TYPE.SUCCESS);
	};

	// Delete fragment from collection
	const onDeleteFragment = (fragmentId: number) => {
		setIsOptionsMenuOpen(null);

		// Sort fragments by position
		const orderedFragments = orderBy(
			collection.collection_fragments.filter(
				(fragment: Avo.Collection.Fragment) => fragment.id !== fragmentId
			),
			['position'],
			['asc']
		);

		const updatedFragmentIds = (collection.collection_fragment_ids || []).filter((id: number) => {
			return id !== fragmentId;
		});

		const positionedFragments = reorderFragments(orderedFragments);

		updateCollection({
			...collection,
			collection_fragments: positionedFragments,
			collection_fragment_ids: updatedFragmentIds,
		});

		toastService('Fragment is succesvol verwijderd', TOAST_TYPE.SUCCESS);
	};

	const renderCollectionFragment = (itemMeta: any) => {
		return (
			<>
				<div className="c-card">
					<div className="c-card__header">
						<Toolbar>
							<ToolbarLeft>
								<ToolbarItem>
									<div className="c-button-toolbar">
										{!isFirst(index) && renderReorderButton(fragment.position, 'up')}
										{!isLast(index) && renderReorderButton(fragment.position, 'down')}
										{itemMeta && <Button icon="scissors" label="Knippen" type="secondary" />}
									</div>
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<ControlledDropdown
										isOpen={isOptionsMenuOpen === fragment.id}
										onOpen={() => setIsOptionsMenuOpen(fragment.id)}
										onClose={() => setIsOptionsMenuOpen(null)}
										placement="bottom-end"
										autoSize
									>
										<DropdownButton>
											<Button type="secondary" icon="more-horizontal" ariaLabel="Meer opties" />
										</DropdownButton>
										<DropdownContent>
											<MenuContent
												menuItems={[
													{ icon: 'copy', id: 'duplicate', label: 'Dupliceren' },
													{ icon: 'arrow-right', id: 'move', label: 'Verplaatsen' },
													{ icon: 'delete', id: 'delete', label: 'Verwijderen' },
													{
														icon: 'copy',
														id: 'copyToCollection',
														label: 'Kopiëren naar andere collectie',
													},
													{
														icon: 'arrow-right',
														id: 'moveToCollection',
														label: 'Verplaatsen naar andere collectie',
													},
												]}
												onClick={itemId => {
													switch (itemId) {
														case 'duplicate':
															onDuplicateFragment(fragment.id);
															break;
														case 'move':
															onMoveFragment();
															break;
														case 'delete':
															onDeleteFragment(fragment.id);
															break;
														case 'copyToCollection':
															onCopyFragmentToCollection();
															break;
														case 'moveToCollection':
															onMoveFragmentToCollection();
															break;
														default:
															return null;
													}
												}}
											/>
										</DropdownContent>
									</ControlledDropdown>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</div>
					<div className="c-card__body">
						{!!fragment.external_id ? (
							<Grid>
								<Column size="3-6">
									<Thumbnail category="collection" label="collectie" />
								</Column>
								<Column size="3-6">{renderForm(fragment, itemMeta, index)}</Column>
							</Grid>
						) : (
							<Form>{renderForm(fragment, itemMeta, index)}</Form>
						)}
					</div>
				</div>
				<AddFragment
					index={index}
					collection={collection}
					updateCollection={updateCollection}
					reorderFragments={reorderFragments}
				/>
			</>
		);
	};

	return fragment.external_id ? (
		// TODO: Change when relationship between item_meta and collection exists
		<DataQueryComponent
			query={GET_ITEM_META_BY_EXTERNAL_ID}
			variables={{ externalId: fragment.external_id }}
			resultPath="app_item_meta[0]"
			renderData={renderCollectionFragment}
			notFoundMessage="De meta item van deze collectie werd niet gevonden"
		/>
	) : (
		renderCollectionFragment(null)
	);
};

export default withRouter(withApollo(CollectionFragment));
