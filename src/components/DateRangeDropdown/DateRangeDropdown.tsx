import { get } from 'lodash-es';
import React, { Component } from 'react';
import { setDeepState, unsetDeepState } from '../../helpers/setDeepState';

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
	onChange: (dateRange: { gte: string; lte: string }, id: string) => void;
}

export interface DateRangeDropdownState {
	range: {
		gte: string;
		lte: string;
	};
	showYearControls: boolean;
	isDropdownOpen: boolean;
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
		};
	}

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
	};

	openDropdown = async () => {
		await setDeepState(this, 'isDropdownOpen', true);
	};

	closeDropdown = async () => {
		await setDeepState(this, 'isDropdownOpen', false);
	};

	render() {
		const { label, id, onChange } = this.props;
		const { showYearControls, isDropdownOpen } = this.state;

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
									defaultChecked={true}
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
												defaultValue={
													(get(this.state, `formState.range.gte`) || '').split('-')[0] || undefined
												}
												onChange={async (value: string) => {
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
												defaultValue={
													(get(this.state, `formState.range.lte`) || '').split('-')[0] || undefined
												}
												onChange={async (value: string) => {
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
												defaultValue={get(this.state, `formState.range.gte`)}
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
												defaultValue={get(this.state, `formState.range.lte`)}
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
								onClick={() => onChange(this.state.range, id)}
							/>
						</FormGroup>
					</Form>
				</div>
			</Dropdown>
		);
	}
}
