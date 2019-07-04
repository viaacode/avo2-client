import React, { FunctionComponent, useState } from 'react';

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
} from '@viaa/avo2-components';

export interface DateRangeDropdownProps {
	label: string;
	id: string;
	range?: { gte: string; lte: string };
	onChange: (dateRange: { gte: string; lte: string }, id: string) => void;
}

export interface DateRangeDropdownState {
	// External range state
	range: {
		gte: string;
		lte: string;
	};
	showYearControls: boolean;
	isDropdownOpen: boolean;
	yearInputGte: string;
	yearInputLte: string;
}

export const DateRangeDropdown: FunctionComponent<DateRangeDropdownProps> = ({
	label,
	id,
	range = { gte: '', lte: '' },
	onChange,
}: DateRangeDropdownProps) => {
	// Internal range state (copied to external range state when the user clicks on the apply button
	const [rangeState, setRange] = useState(range);
	const [showYearControls, setShowYearControls] = useState(true);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [yearInputGte, setYearInputGte] = useState('');
	const [yearInputLte, setYearInputLte] = useState('');

	/**
	 * Use the state from the parent page before showing the checkboxes to the user
	 */
	const resetCheckboxStates = async (): Promise<void> => {
		setRange(range);
	};

	/**
	 * State is only passed from the component to the parent when the user clicks the "Apply" button
	 */
	const applyFilter = async (): Promise<void> => {
		onChange(rangeState, id);
		await closeDropdown();
	};

	const handleDateChange = async (date: string | null, id: string) => {
		if (date) {
			setRange({
				...rangeState,
				[id]: date,
			});
		} else {
			setRange({
				...rangeState,
				[id]: '',
			});
		}
	};

	/**
	 * Called when the user switches between "year" range and "full date" range controls
	 * @param type
	 */
	const dateTypeChanged = (type: 'year' | 'date') => {
		setShowYearControls(type === 'year');
		if (type === 'year') {
			// Round selected dates to the larger year
			setRange({
				gte: `${rangeState.gte.split('-')[0]}-01-01`,
				lte: `${rangeState.lte.split('-')[0]}-12-31`,
			});
		}
	};

	const openDropdown = async () => {
		await resetCheckboxStates();
		setIsDropdownOpen(true);
	};

	const closeDropdown = async () => {
		setIsDropdownOpen(false);
	};

	const from = rangeState.gte;
	const till = rangeState.lte;
	let fromYear: string;
	let tillYear: string;

	// Get year from state or yearInputString
	if (showYearControls) {
		fromYear = (yearInputGte || from || '').split('-')[0];
		tillYear = (yearInputLte || till || '').split('-')[0];
	} else {
		fromYear = (from || yearInputGte || '').split('-')[0];
		tillYear = (till || yearInputLte || '').split('-')[0];
	}

	const fromDate: Date | null = from ? new Date(from) : null;
	const tillDate: Date | null = till ? new Date(till) : null;

	return (
		<Dropdown
			label={label}
			autoSize={true}
			isOpen={isDropdownOpen}
			onOpen={openDropdown}
			onClose={closeDropdown}
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
										await dateTypeChanged('year');
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
										await dateTypeChanged('date');
									}
								}}
							/>
						</RadioButtonGroup>
						{showYearControls && (
							<Grid>
								<Column size="6">
									<FormGroup label="Van">
										<TextInput
											id="gte"
											placeholder="JJJJ"
											value={fromYear}
											onChange={async (value: string) => {
												setYearInputGte(value);
												if (value.length === 4) {
													await handleDateChange(`${value}-01-01`, 'gte');
												}
											}}
										/>
									</FormGroup>
								</Column>
								<Column size="6">
									<FormGroup label="Tot">
										<TextInput
											id="lte"
											placeholder="JJJJ"
											value={tillYear}
											onChange={async (value: string) => {
												setYearInputLte(value);
												if (value.length === 4) {
													await handleDateChange(`${value}-12-31`, 'lte');
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
											id="gte"
											value={fromDate}
											onChange={value =>
												handleDateChange(
													value && value.toISOString().substring(0, '2000-01-01'.length),
													'gte'
												)
											}
										/>
									</FormGroup>
								</Column>
								<Column size="6">
									<FormGroup label="Tot">
										<DatePicker
											id="lte"
											value={tillDate}
											onChange={value =>
												handleDateChange(
													value && value.toISOString().substring(0, '2000-01-01'.length),
													'lte'
												)
											}
										/>
									</FormGroup>
								</Column>
							</Grid>
						)}
					</FormGroup>
					<FormGroup>
						<Button label="Toepassen" type="primary" block={true} onClick={applyFilter} />
					</FormGroup>
				</Form>
			</div>
		</Dropdown>
	);
};
