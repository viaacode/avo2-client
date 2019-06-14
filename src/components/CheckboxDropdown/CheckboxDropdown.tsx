import { compact, fromPairs } from 'lodash-es';
import React, { Component } from 'react';
import { setDeepState } from '../../helpers/setDeepState';

import { Button, Checkbox, CheckboxGroup, Dropdown, Form, FormGroup } from '../avo2-components/src';

export interface CheckboxOption {
	label: string;
	id: string;
	checked: boolean;
}

export interface CheckboxDropdownProps {
	label: string;
	id: string;
	options: CheckboxOption[];
	collapsedItemCount?: number;
	onChange: (checkedOptions: string[], id: string) => void;
}

export interface CheckboxDropdownState {
	checkedStates: { [checkboxId: string]: boolean };
	showCollapsed: boolean;
	isOpen: boolean;
}

export class CheckboxDropdown extends Component<CheckboxDropdownProps, CheckboxDropdownState> {
	constructor(props: CheckboxDropdownProps) {
		super(props);
		this.state = {
			checkedStates: fromPairs(
				props.options.map((option: CheckboxOption) => [option.id, option.checked])
			),
			showCollapsed: false,
			isOpen: false,
		};
	}

	handleToggle = async (checked: boolean, id: string) => {
		await setDeepState(this, `checkedStates.${id}`, checked);
	};

	handleShowCollapsedClick = () => {
		this.setState({
			showCollapsed: !this.state.showCollapsed,
		});
	};

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

	render() {
		const { options, label, id } = this.props;
		const splitCount = this.props.collapsedItemCount || Math.min(options.length, 10);
		const showExpandToggle = splitCount < options.length;

		return (
			<Dropdown label={label} autoSize={true}>
				<div className="u-spacer">
					<Form>
						<FormGroup label={label} labelFor={id}>
							<CheckboxGroup>
								{options.map(
									(option: CheckboxOption, index: number) =>
										(index < splitCount || this.state.showCollapsed) && (
											<Checkbox
												key={option.id}
												id={option.id}
												label={option.label}
												defaultChecked={option.checked}
												onChange={(checked: boolean) => this.handleToggle(checked, option.id)}
											/>
										)
								)}
								{showExpandToggle && (
									// eslint-disable-next-line jsx-a11y/anchor-is-valid
									<a className="c-link-toggle" onClick={this.handleShowCollapsedClick}>
										<div className="c-link-toggle__label u-spacer-bottom">
											{this.state.showCollapsed ? 'Toon minder' : 'Toon meer'}
										</div>
									</a>
								)}
							</CheckboxGroup>
						</FormGroup>
						<FormGroup>
							<Button
								label="Toepassen"
								type="primary"
								block={true}
								className="c-dropdown-menu__close"
								onClick={() => this.applyFilter()}
							/>
						</FormGroup>
					</Form>
				</div>
			</Dropdown>
		);
	}
}
