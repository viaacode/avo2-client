import React, { Fragment, FunctionComponent, useState } from 'react';

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
}

const EditCollectionContent: FunctionComponent<EditCollectionContentProps> = ({ collection }) => {
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(null);

	// Render field according to "renderType" attribute
	const renderField = (field: any, index: number) => {
		const { editorType, name, label, value, required } = field;

		switch (editorType) {
			case 'string':
				return (
					<FormGroup label={`Tekstblok ${label}`} labelFor={name} key={name}>
						<TextInput id={name} type="text" value={value} placeholder={label} />
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
						<WYSIWYG id={`${name}_${index}`} data={value} />
					</FormGroup>
				);
			default:
				return null;
		}
	};

	return (
		<Container mode="vertical">
			{collection.fragments.map((fragment: any, index: number) => (
				<Container mode="horizontal" key={fragment.id}>
					<div className="c-card">
						<div className="c-card__header">
							<Toolbar>
								<ToolbarLeft>
									<ToolbarItem>
										<div className="c-button-toolbar">
											<Button type="secondary" icon="chevron-up" />
											<Button type="secondary" icon="chevron-down" />
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
														onClick={() => {
															setIsOptionsMenuOpen(null);
															// TODO show toast
														}}
													>
														<div className="c-menu__label">Dupliceren</div>
													</a>
													<a
														className="c-menu__item"
														onClick={() => {
															setIsOptionsMenuOpen(null);
															// TODO show toast
														}}
													>
														<div className="c-menu__label">Verplaatsen</div>
													</a>
													<a
														className="c-menu__item"
														onClick={() => {
															setIsOptionsMenuOpen(null);
															// TODO show toast
														}}
													>
														<div className="c-menu__label">Verwijderen</div>
													</a>
													<a
														className="c-menu__item"
														onClick={() => {
															setIsOptionsMenuOpen(null);
															// TODO show toast
														}}
													>
														<div className="c-menu__label">Kopiëren naar andere collectie</div>
													</a>
													<a
														className="c-menu__item"
														onClick={() => {
															setIsOptionsMenuOpen(null);
															// TODO show toast
														}}
													>
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
										<Form>{fragment.fields.map((field: any) => renderField(field, index))}</Form>
									</Column>
								</Grid>
							) : (
								<Form>{fragment.fields.map((field: any) => renderField(field, index))}</Form>
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
