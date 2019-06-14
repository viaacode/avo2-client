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
	showYearInterval: boolean;
}

export class DateRangeDropdown extends Component<DateRangeDropdownProps, DateRangeDropdownState> {
	constructor(props: DateRangeDropdownProps) {
		super(props);
		this.state = {
			range: {
				gte: '',
				lte: '',
			},
			showYearInterval: true,
		};
	}

	handleDateChange = async (date: string | null, id: string) => {
		if (date) {
			await setDeepState(this, id, date);
		} else {
			await unsetDeepState(this, id);
		}
		if (this.props.onChange) {
			this.props.onChange(this.state.range, this.props.id);
		}
	};

	render() {
		const { label, id, onChange } = this.props;

		return (
			<Dropdown label={label} autoSize={true}>
				<div className="u-spacer">
					<Form>
						<label>Hoe specifiek?</label>
						<br />
						<span>TODO add radio buttons</span>
						<br />
						<FormGroup>
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
						</FormGroup>
						<FormGroup>
							<Button
								label="Toepassen"
								type="primary"
								block={true}
								onClick={() => onChange(this.state.range, id)}
							/>
						</FormGroup>
					</Form>
				</div>
			</Dropdown>
		);
	}
}
