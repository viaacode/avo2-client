import { compact, fromPairs } from 'lodash-es';
import React, { Component } from 'react';
import { setDeepState } from '../../helpers/setDeepState';

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
	initialOptions: CheckboxOption[];
	// optionsCallback: (query: string) => CheckboxOption[];
	disabled?: boolean;
	onChange: (checkedOptions: string[], id: string) => void;
}

export interface CheckboxModalState {
	checkedStates: { [checkboxId: string]: boolean };
	isOpen: boolean;
	searchTerm: string;
}

export class CheckboxModal extends Component<CheckboxModalProps, CheckboxModalState> {
	constructor(props: CheckboxModalProps) {
		super(props);
		this.state = {
			checkedStates: fromPairs(
				props.initialOptions.map((option: CheckboxOption) => [option.id, option.checked])
			),
			isOpen: false,
			searchTerm: '',
		};
	}

	applyFilter(): void {
		this.props.onChange(
			compact(
				Object.keys(this.state.checkedStates).map(key =>
					this.state.checkedStates[key] ? key : null
				)
			),
			this.props.id
		);
	}

	handleCheckboxToggled = async (checked: boolean, id: string) => {
		await setDeepState(this, `checkedStates.${id}`, checked);
	};

	private openModal = () => {
		this.setState({
			isOpen: true,
		});
	};

	private closeModal = () => {
		this.setState({
			isOpen: false,
		});
	};

	private renderCheckboxGroup(options: CheckboxOption[]) {
		return (
			<FormGroup>
				<CheckboxGroup>
					{options.map((option: CheckboxOption) => (
						<Checkbox
							key={option.id}
							id={option.id}
							label={option.label}
							defaultChecked={option.checked}
							onChange={(checked: boolean) => this.handleCheckboxToggled(checked, option.id)}
						/>
					))}
				</CheckboxGroup>
			</FormGroup>
		);
	}

	render() {
		const { initialOptions, label, disabled } = this.props;
		const { isOpen } = this.state;

		const oneThird = Math.ceil(initialOptions.length / 3);
		const firstColumnOptions = initialOptions.slice(0, oneThird);
		const secondColumnOptions = initialOptions.slice(oneThird, oneThird * 2);
		const thirdColumnOptions = initialOptions.slice(oneThird * 2);

		return (
			<div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
				<button className="c-button c-button--secondary" onClick={this.openModal}>
					<div className="c-button__content">
						<div className="c-button__label">{label}</div>
						<Icon name={isOpen ? 'caret-up' : 'caret-down'} size="small" type="arrows" />
					</div>
				</button>
				<Modal isOpen={isOpen} title={label} size="large" onClose={this.closeModal}>
					<ModalHeaderRight>
						<TextInput placeholder="Zoeken..." icon="search" />
					</ModalHeaderRight>
					<ModalBody>
						<div className="u-spacer">
							<Form>
								<Grid>
									<Column size="2-4">{this.renderCheckboxGroup(firstColumnOptions)}</Column>
									<Column size="2-4">{this.renderCheckboxGroup(secondColumnOptions)}</Column>
									<Column size="2-4">{this.renderCheckboxGroup(thirdColumnOptions)}</Column>
								</Grid>
							</Form>
						</div>
					</ModalBody>
					<ModalFooterLeft>
						<FormGroup>
							<Button label="Annuleren" type="secondary" block={true} onClick={this.closeModal} />
						</FormGroup>
					</ModalFooterLeft>
					<ModalFooterRight>
						<FormGroup>
							<Button
								label="Toepassen"
								type="primary"
								block={true}
								onClick={() => {
									this.applyFilter();
									this.closeModal();
								}}
							/>
						</FormGroup>
					</ModalFooterRight>
				</Modal>
			</div>
		);
	}
}
