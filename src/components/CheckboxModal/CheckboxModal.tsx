import { compact, fromPairs } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import {
	Button,
	Checkbox,
	CheckboxGroup,
	Column,
	Form,
	FormGroup,
	Grid,
	Icon,
	Modal,
	ModalBody,
	ModalFooterLeft,
	ModalFooterRight,
	TextInput,
} from '../avo2-components/src';
import { ModalHeaderRight } from '../avo2-components/src/components/Modal/Modal.slots';

export interface CheckboxOption {
	label: string;
	id: string;
	checked: boolean;
}

export interface CheckboxModalProps {
	label: string;
	id: string;
	options: CheckboxOption[];
	// optionsCallback: (query: string) => CheckboxOption[];
	disabled?: boolean;
	onChange: (checkedOptions: string[], id: string) => void;
}

export interface CheckboxModalState {
	checkedStates: { [checkboxId: string]: boolean };
	isModalOpen: boolean;
	searchTerm: string;
}

export const CheckboxModal: FunctionComponent<CheckboxModalProps> = ({
	label,
	id,
	options,
	disabled,
	onChange,
}: CheckboxModalProps) => {
	const [checkedStates, setCheckedStates] = useState(fromPairs(
		options.map((option: CheckboxOption) => [option.id, option.checked])
	) as { [checkboxId: string]: boolean });
	const [isModalOpen, setIsModalOpen] = useState(false as boolean);
	// TODO add support for searching checkbox options
	// const [searchTerm, setSearchTerm] = useState('' as string);

	/**
	 * Use the state from the parent page before showing the checkboxes to the user
	 */
	const resetCheckboxStates = async (): Promise<void> => {
		setCheckedStates(
			fromPairs(options.map((option: CheckboxOption) => [option.id, option.checked]))
		);
	};

	/**
	 * State is only passed from the component to the parent when the user clicks the "Apply" button
	 */
	const applyFilter = async (): Promise<void> => {
		onChange(compact(Object.keys(checkedStates).map(key => (checkedStates[key] ? key : null))), id);
		await closeModal();
	};

	const handleCheckboxToggled = async (checked: boolean, id: string) => {
		setCheckedStates({
			...checkedStates,
			[id]: checked,
		});
	};

	const openModal = async (): Promise<void> => {
		await resetCheckboxStates();
		setIsModalOpen(true);
	};

	const closeModal = async (): Promise<void> => {
		setIsModalOpen(false);
	};

	const renderCheckboxGroup = (options: CheckboxOption[]) => {
		return (
			<FormGroup>
				<CheckboxGroup>
					{options.map((option: CheckboxOption) => (
						<Checkbox
							key={option.id}
							id={option.id}
							label={option.label}
							checked={checkedStates[option.id]}
							onChange={(checked: boolean) => handleCheckboxToggled(checked, option.id)}
						/>
					))}
				</CheckboxGroup>
			</FormGroup>
		);
	};

	const oneThird = Math.ceil(options.length / 3);
	const firstColumnOptions = options.slice(0, oneThird);
	const secondColumnOptions = options.slice(oneThird, oneThird * 2);
	const thirdColumnOptions = options.slice(oneThird * 2);

	return (
		<div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
			<button className="c-button c-button--secondary" onClick={openModal}>
				<div className="c-button__content">
					<div className="c-button__label">{label}</div>
					<Icon name={isModalOpen ? 'caret-up' : 'caret-down'} size="small" type="arrows" />
				</div>
			</button>
			<Modal isOpen={isModalOpen} title={label} size="large" onClose={closeModal}>
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
				<ModalFooterLeft>
					<FormGroup>
						<Button label="Annuleren" type="secondary" block={true} onClick={closeModal} />
					</FormGroup>
				</ModalFooterLeft>
				<ModalFooterRight>
					<FormGroup>
						<Button
							label="Toepassen"
							type="primary"
							block={true}
							onClick={() => {
								applyFilter();
								closeModal();
							}}
						/>
					</FormGroup>
				</ModalFooterRight>
			</Modal>
		</div>
	);
};
