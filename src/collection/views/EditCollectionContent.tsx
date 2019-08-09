import React, { Fragment, FunctionComponent, useState } from 'react';

import { orderBy } from 'lodash-es';

import {
	Button,
	Column,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Grid,
	TextInput,
	Thumbnail,
	Toolbar,
	ToolbarCenter,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	WYSIWYG,
} from '@viaa/avo2-components';

interface EditCollectionContentProps {
	collection: any;
	swapFragments: (fragments: any[], currentId: number, direction: 'up' | 'down') => void;
	updateCollection: (collection: any) => void;
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
	const isNotLast = (index: number) => index !== collection.fragments.length - 1;

	// Delete fragment from collection
	const onDeleteFragment = (fragmentId: number) => {
		setIsOptionsMenuOpen(null);

		// Sort fragments by position
		const orderedFragments = orderBy(
			collection.fragments.filter((fragment: any) => fragment.id !== fragmentId),
			['position'],
			['asc']
		);

		// Reposition fragments
		const positionedFragments = orderedFragments.map((fragment: any, index: number) => ({
			...fragment,
			position: index + 1,
		}));

		updateCollection({
			...collection,
			fragments: positionedFragments,
		});

		// TODO: Show toast
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
			onClick={() => swapFragments(collection.fragments, fragmentId, direction)}
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
				<WYSIWYG id={`beschrijving_${index}`} data={fragment.custom_description || ''} />
			</FormGroup>
		</Form>
	);

	return (
		<Container mode="vertical">
			{orderBy(collection.fragments, ['position'], ['asc']).map((fragment: any, index: number) => (
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
										<Dropdown
											isOpen={isOptionsMenuOpen === fragment.id}
											onOpen={() => setIsOptionsMenuOpen(fragment.id)}
											onClose={() => setIsOptionsMenuOpen(null)}
											placement="bottom-end"
											autoSize
										>
											<DropdownButton>
												<Button type="secondary" icon="more-horizontal" />
											</DropdownButton>
											<DropdownContent>
												<Fragment>
													<a
														className="c-menu__item"
														onClick={() => onDuplicateFragment(fragment.id)}
													>
														<div className="c-menu__label">Dupliceren</div>
													</a>
													<a className="c-menu__item" onClick={() => onMoveFragment()}>
														<div className="c-menu__label">Verplaatsen</div>
													</a>
													<a className="c-menu__item" onClick={() => onDeleteFragment(fragment.id)}>
														<div className="c-menu__label">Verwijderen</div>
													</a>
													<a className="c-menu__item" onClick={() => onCopyFragmentToCollection()}>
														<div className="c-menu__label">Kopiëren naar andere collectie</div>
													</a>
													<a className="c-menu__item" onClick={() => onMoveFragmentToCollection()}>
														<div className="c-menu__label">Verplaatsen naar andere collectie</div>
													</a>
												</Fragment>
											</DropdownContent>
										</Dropdown>
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
						<Toolbar>
							<ToolbarCenter>
								<ToolbarItem>
									<Button type="secondary" icon="add" />
									<div className="u-sr-accessible">Sectie toevoegen</div>
								</ToolbarItem>
							</ToolbarCenter>
						</Toolbar>
					</Container>
				</Container>
			))}
		</Container>
	);
};

export default EditCollectionContent;
