import { orderBy } from 'lodash-es';
import React, { FunctionComponent } from 'react';

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
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	WYSIWYG,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import AddFragment from './AddFragment';

interface CollectionFragmentProps {
	index: number;
	collection: Avo.Collection.Response;
	swapFragments: (currentId: number, direction: 'up' | 'down') => void;
	updateFragmentProperty: (value: string, fieldName: string, fragmentId: number) => void;
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

	const renderForm = (fragment: any, index: number) => (
		<Form>
			<FormGroup label={`Tekstblok titel`} labelFor="title">
				<TextInput
					id="title"
					type="text"
					value={fragment.custom_title || ''}
					placeholder="Titel"
					onChange={(value: string) => updateFragmentProperty(value, 'custom_title', fragment.id)}
				/>
			</FormGroup>
			<FormGroup label={`Tekstblok beschrijving`} labelFor={`beschrijving_${index}`}>
				<>
					<WYSIWYG
						id={`beschrijving_${index}`}
						data={fragment.custom_description || ''}
						onChange={
							((e: any) =>
								updateFragmentProperty(
									e.target.innerHTML,
									'custom_description',
									fragment.id
								)) as any // TODO remove any type once components deploy is working again
						}
					/>
				</>
			</FormGroup>
		</Form>
	);

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
							<Column size="3-6">{renderForm(fragment, index)}</Column>
						</Grid>
					) : (
						<Form>{renderForm(fragment, index)}</Form>
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

export default CollectionFragment;
