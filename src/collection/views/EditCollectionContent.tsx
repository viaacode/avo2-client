import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';

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
	onChangeFieldValue: (fragmentId: number, fieldName: string, fieldValue: string) => void;
}

const EditCollectionContent: FunctionComponent<EditCollectionContentProps> = ({
	collection,
	swapFragments,
	onChangeFieldValue,
}) => {
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(null);

	const isNotFirst = (index: number) => index !== 0;
	const isNotLast = (index: number) => index !== collection.fragments.length - 1;

	// Render field according to "renderType" attribute
	const renderField = (fragmentId: number, field: any, index: number) => {
		const { editorType, name, label, value, required } = field;

		switch (editorType) {
			case 'string':
				return (
					<FormGroup label={`Tekstblok ${label}`} labelFor={name} key={name}>
						<TextInput
							id={name}
							type="text"
							value={value}
							placeholder={label}
							onChange={value => onChangeFieldValue(fragmentId, name, value)}
						/>
					</FormGroup>
				);
			case 'textarea':
				// TODO: Add required to WYSIWYG
				return (
					<FormGroup
						label={`Tekstblok ${label}`}
						labelFor={`${name}_${index}`}
						key={`${name}_${index}`}
					>
						<WYSIWYG
							id={`${name}_${index}`}
							data={value}
							// onChange={value => onChangeFieldValue(fragmentId, name, value)}
						/>
					</FormGroup>
				);
			default:
				return null;
		}
	};

	// Render reorder button according to direction.
	const renderReorderButton = (fragmentId: number, direction: 'up' | 'down') => (
		<Button
			type="secondary"
			icon={`chevron-${direction}`}
			onClick={() => swapFragments(collection.fragments, fragmentId, direction)}
		/>
	);

	const onDuplicateFragment = () => {
		setIsOptionsMenuOpen(null);
		// TODO show toast
	};

	const onMoveFragment = () => {
		setIsOptionsMenuOpen(null);
		// TODO show toast
	};

	const onDeleteFragment = () => {
		setIsOptionsMenuOpen(null);
		// TODO show toast
	};

	const onCopyFragmentToCollection = () => {
		setIsOptionsMenuOpen(null);
		// TODO show toast
	};

	const onMoveFragmentToCollection = () => {
		setIsOptionsMenuOpen(null);
		// TODO show toast
	};

	return (
		<Container mode="vertical">
			{orderBy(collection.fragments, ['id'], ['asc']).map((fragment: any, index: number) => (
				<Container mode="horizontal" key={fragment.id}>
					<div className="c-card">
						<div className="c-card__header">
							<Toolbar>
								<ToolbarLeft>
									<ToolbarItem>
										<div className="c-button-toolbar">
											{isNotFirst(index) && renderReorderButton(fragment.id, 'up')}
											{isNotLast(index) && renderReorderButton(fragment.id, 'down')}
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
													<a className="c-menu__item" onClick={onDuplicateFragment}>
														<div className="c-menu__label">Dupliceren</div>
													</a>
													<a className="c-menu__item" onClick={onMoveFragment}>
														<div className="c-menu__label">Verplaatsen</div>
													</a>
													<a className="c-menu__item" onClick={onDeleteFragment}>
														<div className="c-menu__label">Verwijderen</div>
													</a>
													<a className="c-menu__item" onClick={onCopyFragmentToCollection}>
														<div className="c-menu__label">Kopiëren naar andere collectie</div>
													</a>
													<a className="c-menu__item" onClick={onMoveFragmentToCollection}>
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
							{!!fragment.fields.filter((field: any) => field.name === 'external_id').length ? (
								<Grid>
									<Column size="3-6">
										<Thumbnail category="collection" label="collectie" />
									</Column>
									<Column size="3-6">
										<Form>
											{fragment.fields.map((field: any) => renderField(fragment.id, field, index))}
										</Form>
									</Column>
								</Grid>
							) : (
								<Form>
									{fragment.fields.map((field: any) => renderField(fragment.id, field, index))}
								</Form>
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
