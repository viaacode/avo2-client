import { get } from 'lodash-es';
import React, { Component } from 'react';
import { setDeepState, setState, unsetDeepState } from '../../helpers/setState';

import {
	Button,
	Column,
	DatePicker,
	Dropdown,
	Form,
	FormGroup,
	Grid,
	RadioButton,
	RadioButtonGroup,
	TextInput,
} from '../avo2-components/src';

export interface DateRangeDropdownProps {
	label: string;
	id: string;
	range?: { gte: string; lte: string };
	onChange: (dateRange: { gte: string; lte: string }, id: string) => void;
}

export interface DateRangeDropdownState {
	range: {
		gte: string;
		lte: string;
	};
	showYearControls: boolean;
	isDropdownOpen: boolean;
	yearInputGte: string;
	yearInputLte: string;
}

export class DateRangeDropdown extends Component<DateRangeDropdownProps, DateRangeDropdownState> {
	constructor(props: DateRangeDropdownProps) {
		super(props);
		this.state = {
			range: {
				gte: '',
				lte: '',
			},
			showYearControls: true,
			isDropdownOpen: false,
			yearInputGte: '',
			yearInputLte: '',
		};
	}

	/**
	 * Use the state from the parent page before showing the checkboxes to the user
	 */
	resetCheckboxStates = async (): Promise<void> => {
		await setState(this, {
			range: this.props.range,
		});
	};

	/**
	 * State is only passed from the component to the parent when the user clicks the "Apply" button
	 */
	applyFilter = async (): Promise<void> => {
		this.props.onChange(this.state.range, this.props.id);
		await this.closeDropdown();
	};

	handleDateChange = async (date: string | null, id: string) => {
		if (date) {
			await setDeepState(this, id, date);
		} else {
			await unsetDeepState(this, id);
		}
	};

	/**
	 * Called when the user switches between "year" range and "full date" range controls
	 * @param type
	 */
	dateTypeChanged = async (type: 'year' | 'date') => {
		await setDeepState(this, 'showYearControls', type === 'year');
		if (type === 'year') {
			// Round selected dates to the larger year
			await setState(this, {
				range: {
					gte: `${this.state.range.gte.split('-')[0]}-01-01`,
					lte: `${this.state.range.lte.split('-')[0]}-12-31`,
				},
			});
		}
	};

	openDropdown = async () => {
		await this.resetCheckboxStates();
		await setDeepState(this, 'isDropdownOpen', true);
	};

	closeDropdown = async () => {
		await setDeepState(this, 'isDropdownOpen', false);
	};

	render() {
		const { label } = this.props;
		const { showYearControls, isDropdownOpen } = this.state;
		const from = get(this.state, `range.gte`);
		const till = get(this.state, `range.lte`);
		let fromYear: string;
		let tillYear: string;

		// Get year from state or yearInputString
		if (showYearControls) {
			fromYear = (get(this.state, 'yearInputGte') || get(this.state, `range.gte`) || '').split(
				'-'
			)[0];
			tillYear = (get(this.state, 'yearInputLte') || get(this.state, `range.lte`) || '').split(
				'-'
			)[0];
		} else {
			fromYear = (get(this.state, `range.gte`) || get(this.state, 'yearInputGte') || '').split(
				'-'
			)[0];
			tillYear = (get(this.state, `range.lte`) || get(this.state, 'yearInputLte') || '').split(
				'-'
			)[0];
		}

		const fromDate: Date | null = from ? new Date(from) : null;
		const tillDate: Date | null = till ? new Date(till) : null;

		return (
			<Dropdown
				label={label}
				autoSize={true}
				isOpen={isDropdownOpen}
				onOpen={this.openDropdown}
				onClose={this.closeDropdown}
			>
				<div className="u-spacer">
					<Form>
						<FormGroup label="Hoe specifiek?">
							<RadioButtonGroup inline={true}>
								<RadioButton
									label="Op jaartal"
									name="year"
									value="year"
									checked={showYearControls}
									onChange={async (checked: boolean) => {
										if (checked) {
											await this.dateTypeChanged('year');
										}
									}}
								/>
								<RadioButton
									label="Specifieke datums"
									name="year"
									value="date"
									checked={!showYearControls}
									onChange={async (checked: boolean) => {
										if (checked) {
											await this.dateTypeChanged('date');
										}
									}}
								/>
							</RadioButtonGroup>
							{showYearControls && (
								<Grid>
									<Column size="6">
										<FormGroup label="Van">
											<TextInput
												id={`range.gte`}
												placeholder="JJJJ"
												value={fromYear}
												onChange={async (value: string) => {
													await setState(this, { yearInputGte: value });
													if (value.length === 4) {
														await this.handleDateChange(`${value}-01-01`, `range.gte`);
													}
												}}
											/>
										</FormGroup>
									</Column>
									<Column size="6">
										<FormGroup label="Tot">
											<TextInput
												id={`range.lte`}
												placeholder="JJJJ"
												value={tillYear}
												onChange={async (value: string) => {
													await setState(this, { yearInputLte: value });
													if (value.length === 4) {
														await this.handleDateChange(`${value}-12-31`, `range.lte`);
													}
												}}
											/>
										</FormGroup>
									</Column>
								</Grid>
							)}
							{!showYearControls && (
								<Grid>
									<Column size="6">
										<FormGroup label="Van">
											<DatePicker
												id={`range.gte`}
												value={fromDate}
												onChange={value =>
													this.handleDateChange(
														value && value.toISOString().substring(0, '2000-01-01'.length),
														`range.gte`
													)
												}
											/>
										</FormGroup>
									</Column>
									<Column size="6">
										<FormGroup label="Tot">
											<DatePicker
												id={`range.lte`}
												value={tillDate}
												onChange={value =>
													this.handleDateChange(
														value && value.toISOString().substring(0, '2000-01-01'.length),
														`range.lte`
													)
												}
											/>
										</FormGroup>
									</Column>
								</Grid>
							)}
						</FormGroup>
						<FormGroup>
							<Button
								label="Toepassen"
								type="primary"
								block={true}
								className="c-dropdown-menu__close"
								onClick={this.applyFilter}
							/>
						</FormGroup>
					</Form>
				</div>
			</Dropdown>
		);
	}
}
