import React, { FunctionComponent, MouseEvent, ReactText, useState } from 'react';

import {
	Button,
	Column,
	DatePicker,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Grid,
	RadioButton,
	RadioButtonGroup,
	TextInput,
} from '@viaa/avo2-components';
import { reorderDate } from '../../helpers/formatters/date';
import { renderDropdownButton } from '../CheckboxDropdownModal/CheckboxDropdownModal';

export interface DateRangeDropdownProps {
	label: string;
	id: string;
	range?: { gte: string; lte: string };
	onChange: (dateRange: { gte: string; lte: string }, id: string) => void;
}

export interface DateRange {
	gte: string;
	lte: string;
}

const DEFAULT_DATE_RANGE = { gte: '', lte: '' };

export const DateRangeDropdown: FunctionComponent<DateRangeDropdownProps> = ({
	label,
	id,
	range = DEFAULT_DATE_RANGE,
	onChange,
}) => {
	// Internal range state (copied to external range state when the user clicks on the apply button
	const [rangeState, setRangeState] = useState<DateRange>(range);
	const [showYearControls, setShowYearControls] = useState<boolean>(true);
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
	const [yearInputGte, setYearInputGte] = useState<string>('');
	const [yearInputLte, setYearInputLte] = useState<string>('');

	const resetInternalRangeState = async (tagId?: ReactText, evt?: MouseEvent): Promise<void> => {
		evt && evt.stopPropagation();
		setRangeState(range);
	};

	/**
	 * State is only passed from the component to the parent when the user clicks the "Apply" button
	 */
	const applyFilter = async (): Promise<void> => {
		onChange(rangeState, id);
		await closeDropdown();
	};

	const removeFilter = (tagId: ReactText, evt: MouseEvent) => {
		evt.stopPropagation();
		setRangeState(DEFAULT_DATE_RANGE);
		setYearInputGte('');
		setYearInputLte('');
		onChange(DEFAULT_DATE_RANGE, id);
	};

	const handleDateChange = async (date: string | null, id: string) => {
		if (date) {
			setRangeState({
				...rangeState,
				[id]: date,
			});
		} else {
			setRangeState({
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
			setRangeState({
				gte: `${rangeState.gte.split('-')[0]}-01-01`,
				lte: `${rangeState.lte.split('-')[0]}-12-31`,
			});
		}
	};

	const openDropdown = async () => {
		await resetInternalRangeState();
		setIsDropdownOpen(true);
	};

	const closeDropdown = async () => {
		setIsDropdownOpen(false);
	};

	const getTag = () => {
		const isGteStartOfYear = range.gte.includes('-01-01');
		const isLteEndOfYear = range.lte.includes('-12-31');
		const gteFormattedDate = reorderDate(range.gte);
		const lteFormattedDate = reorderDate(range.lte);
		const gteYear = range.gte.split('-')[0];
		const lteYear = range.lte.split('-')[0];
		let label: string | null = null;
		if (range.gte && range.lte) {
			if (isGteStartOfYear && isLteEndOfYear) {
				// only show years
				label = `${gteYear} - ${lteYear}`;
			} else {
				// show full dates
				label = `${reorderDate(range.gte)} - ${reorderDate(range.lte)}`;
			}
		} else if (range.gte) {
			label = `na ${isGteStartOfYear ? gteYear : gteFormattedDate}`;
		} else if (range.lte) {
			label = `voor ${isLteEndOfYear ? lteYear : lteFormattedDate}`;
		}
		if (label) {
			return [
				{
					label,
					id: 'date',
				},
			];
		}
		return []; // Do not render a filter if date object is empty: {gte: "", lte: ""}
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
			<DropdownButton>
				{renderDropdownButton(label, isDropdownOpen, getTag(), removeFilter)}
			</DropdownButton>
			<DropdownContent>
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
			</DropdownContent>
		</Dropdown>
	);
};
