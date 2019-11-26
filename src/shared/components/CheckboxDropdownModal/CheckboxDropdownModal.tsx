import classnames from 'classnames';
import { clone, compact, fromPairs } from 'lodash-es';
import React, { FunctionComponent, MouseEvent, useState } from 'react';

import {
	Button,
	ButtonToolbar,
	Checkbox,
	CheckboxGroup,
	Column,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Grid,
	Icon,
	Modal,
	ModalBody,
	ModalFooterRight,
	ModalHeaderRight,
	Spacer,
	TagList,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

import './CheckboxDropdownModal.scss';

export interface CheckboxOption {
	label: string;
	// Provide option count separately from the label
	// because the selected filters in the taglist do not contain the optionCount
	optionCount?: number;
	id: string;
	checked: boolean;
}

export interface CheckboxDropdownModalProps {
	label: string;
	id: string;
	options: CheckboxOption[];
	disabled?: boolean;
	onChange: (checkedOptions: string[], id: string) => void;
}

const CheckboxDropdownModal: FunctionComponent<CheckboxDropdownModalProps> = ({
	label,
	id,
	options,
	disabled,
	onChange,
}) => {
	const [checkedStates, setCheckedStates] = useState(
		fromPairs(options.map((option: CheckboxOption) => [option.id, option.checked]))
	);
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const handleCheckboxToggled = async (checked: boolean, id: string) => {
		setCheckedStates({
			...checkedStates,
			[id]: checked,
		});
	};

	const resetInternalCheckboxStates = () => {
		setCheckedStates(
			fromPairs(options.map((option: CheckboxOption) => [option.id, option.checked]))
		);
	};

	const getSelectedFilterIds = (checkedStates: { [checkboxId: string]: boolean }) =>
		compact(Object.keys(checkedStates).map(key => (checkedStates[key] ? key : null)));

	const getSelectedTags = (): { label: string; id: string }[] => {
		return compact(
			options.map((option: CheckboxOption) => {
				// Use checked state from parent state
				// so the selected filters inside the dropdown button only change
				// when the user clicks the submit button at the bottom of the dropdown menu
				if (!option.checked) {
					return null;
				}

				return { label: option.label, id: option.id };
			})
		);
	};

	const applyFilter = async (): Promise<void> => {
		onChange(getSelectedFilterIds(checkedStates), id);
		await closeDropdownOrModal();
	};

	const openDropdownOrModal = async () => {
		await resetInternalCheckboxStates();
		setIsOpen(true);
	};

	const closeDropdownOrModal = async () => {
		setIsOpen(false);
	};

	const removeFilter = (tagId: string | number, evt: MouseEvent) => {
		evt.stopPropagation();
		const clonedCheckedStates = clone(checkedStates);
		clonedCheckedStates[tagId] = false;
		setCheckedStates(clonedCheckedStates);
		onChange(getSelectedFilterIds(clonedCheckedStates), id);
	};

	const renderCheckboxGroup = (options: CheckboxOption[]) => {
		return (
			<FormGroup>
				<CheckboxGroup>
					{options.map((option: CheckboxOption) => (
						<Checkbox
							key={option.id}
							id={option.id}
							label={option.optionCount ? `${option.label} (${option.optionCount})` : option.label}
							checked={checkedStates[option.id]}
							onChange={(checked: boolean) => handleCheckboxToggled(checked, option.id)}
						/>
					))}
				</CheckboxGroup>
			</FormGroup>
		);
	};

	const renderCheckboxControl = () => {
		return (
			<Dropdown
				label={label}
				menuWidth="fit-content"
				isOpen={isOpen}
				onOpen={openDropdownOrModal}
				onClose={closeDropdownOrModal}
			>
				<DropdownButton>
					{renderDropdownButton(label, isOpen, getSelectedTags(), removeFilter)}
				</DropdownButton>
				<DropdownContent>
					<Spacer>
						<Form>
							<FormGroup label={label} labelFor={id}>
								<CheckboxGroup>
									{options.map((option: CheckboxOption) => (
										<Checkbox
											key={`checkbox-${id}-${option.id}`}
											id={option.id}
											label={
												option.optionCount
													? `${option.label} (${option.optionCount})`
													: option.label
											}
											checked={checkedStates[option.id]}
											onChange={(checked: boolean) => handleCheckboxToggled(checked, option.id)}
										/>
									))}
								</CheckboxGroup>
							</FormGroup>
							<FormGroup>
								<Button
									label="Toepassen"
									type="primary"
									className="c-apply-filter-button"
									block
									onClick={() => applyFilter()}
								/>
							</FormGroup>
						</Form>
					</Spacer>
				</DropdownContent>
			</Dropdown>
		);
	};

	const renderModalControl = () => {
		const oneThird = Math.ceil(options.length / 3);
		const firstColumnOptions = options.slice(0, oneThird);
		const secondColumnOptions = options.slice(oneThird, oneThird * 2);
		const thirdColumnOptions = options.slice(oneThird * 2);

		// TODO: add search in checkbox modal components
		// private getFilterOptions(searchTerm: string, propertyName: string): Promise<Avo.Search.OptionProp[]> {
		// 	const searchResponse: Avo.Search.Search = await executeSearch();
		// 	return searchResponse.aggregations[propertyName];
		// }

		return (
			<>
				<div className="c-checkbox-dropdown__trigger" onClick={openDropdownOrModal}>
					{renderDropdownButton(label, isOpen, getSelectedTags(), removeFilter)}
				</div>
				<Modal isOpen={isOpen} title={label} size="large" onClose={closeDropdownOrModal} scrollable>
					<ModalHeaderRight>
						<TextInput placeholder="Zoeken..." icon="search" />
					</ModalHeaderRight>
					<ModalBody>
						<div className="u-spacer">
							<Form>
								<Grid>
									<Column size="2-4">{renderCheckboxGroup(firstColumnOptions)}</Column>
									<Column size="2-4">{renderCheckboxGroup(secondColumnOptions)}</Column>
									<Column size="2-4">{renderCheckboxGroup(thirdColumnOptions)}</Column>
								</Grid>
							</Form>
						</div>
					</ModalBody>
					<ModalFooterRight>
						<Toolbar spaced>
							<ToolbarRight>
								<ToolbarItem>
									<ButtonToolbar>
										<Button
											label="Annuleren"
											type="secondary"
											block
											onClick={closeDropdownOrModal}
										/>
										<Button
											label="Toepassen"
											className="c-apply-filter-button"
											type="primary"
											block
											onClick={applyFilter}
										/>
									</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</ModalFooterRight>
				</Modal>
			</>
		);
	};

	return (
		<div className={classnames({ 'u-opacity-50 u-disable-click': disabled })}>
			{options.length <= 7 ? renderCheckboxControl() : null}
			{options.length > 7 ? renderModalControl() : null}
		</div>
	);
};

export const renderDropdownButton = (
	label: string,
	isOpen: boolean,
	selectedTags: { label: string; id: string | number }[],
	removeFilter: (tagId: string | number, clickEvent: MouseEvent) => void
) => {
	return (
		<Button autoHeight className="c-checkbox-dropdown-modal__trigger" type="secondary">
			<div className="c-button__content">
				<div className="c-button__label">{label}</div>
				{!!selectedTags.length && (
					<TagList tags={selectedTags} swatches={false} closable onTagClosed={removeFilter} />
				)}
				<Icon
					className="c-button__icon"
					name={isOpen ? 'caret-up' : 'caret-down'}
					size="small"
					type="arrows"
				/>
			</div>
		</Button>
	);
};

export default CheckboxDropdownModal;
