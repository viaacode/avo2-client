import React, { Fragment, FunctionComponent, useState } from 'react';

import { orderBy } from 'lodash-es';

import {
	Button,
	Column,
	Container,
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

	// Check whether the current fragment is the first and/or last fragment in collection
	const isNotFirst = (index: number) => index !== 0;
	const isNotLast = (index: number) => index !== collection.collection_fragments.length - 1;

	const reorderFragments = (fragments: Avo.Collection.Fragment[]) => {
		return fragments.map((fragment: Avo.Collection.Fragment, index: number) => ({
			...fragment,
			position: index + 1,
		}));
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

		// TODO: Show toast
	};

	const addFragment = (index: number) => {
		const TEXT_BLOCK_FRAGMENT = {
			id: -1 - collection.collection_fragments.length,
			position: 1,
			collection_id: collection.id,
			external_id: '',
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

	const onDuplicateFragment = (fragmentId: number) => {
		setIsOptionsMenuOpen(null);

		// TODO: Show toast
	};

	const onMoveFragment = () => {
		setIsOptionsMenuOpen(null);

		// TODO: Show toast
	};

	const onCopyFragmentToCollection = () => {
		setIsOptionsMenuOpen(null);

		// TODO: Show toast
	};

	const onMoveFragmentToCollection = () => {
		setIsOptionsMenuOpen(null);

		// TODO: Show toast
	};

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
				<Fragment>
					<WYSIWYG
						id={`beschrijving_${index}`}
						data={fragment.custom_description || ''}
						onChange={(e: any) =>
							updateFragmentProperty(e.target.innerHTML, 'custom_description', fragment.id)
						}
					/>
				</Fragment>
			</FormGroup>
		</Form>
	);

	return (
		<Container mode="vertical">
			{orderBy(collection.collection_fragments, ['position'], ['asc']).map(
				(fragment: any, index: number) => (
					<Container mode="horizontal" key={`fragment_${index}`}>
						<div className="c-card">
							<div className="c-card__header">
								<Toolbar>
									<ToolbarLeft>
										<ToolbarItem>
											<div className="c-button-toolbar">
												{isNotFirst(index) && renderReorderButton(fragment.position, 'up')}
												{isNotLast(index) && renderReorderButton(fragment.position, 'down')}
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
																case 'copyToCollection':
																	onCopyFragmentToCollection();
																case 'moveToCollection':
																	onMoveFragmentToCollection();
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
						<Container>
							<div className="c-toolbar">
								<div className="c-toolbar__justified">
									<div className="c-toolbar__item c-toolbar__item--stretch">
										<div className="c-hr" />
									</div>
									<ToolbarItem>
										<Button type="secondary" icon="add" onClick={() => addFragment(index)} />
										<div className="u-sr-accessible">Sectie toevoegen</div>
									</ToolbarItem>
									<div className="c-toolbar__item c-toolbar__item--stretch">
										<div className="c-hr" />
									</div>
								</div>
							</div>
						</Container>
					</Container>
				)
			)}
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
