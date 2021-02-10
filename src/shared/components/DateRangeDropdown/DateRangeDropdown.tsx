import moment from 'moment';
import React, { FunctionComponent, MouseEvent, ReactText, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
	RadioButtonGroup,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';

import { reorderDate } from '../../helpers';
import { ToastService } from '../../services';
import { renderDropdownButton } from '../CheckboxDropdownModal/CheckboxDropdownModal';

export interface DateRangeDropdownProps {
	label: string;
	id: string;
	range?: { gte: string; lte: string };
	showPastFutureOptions?: boolean;
	defaultControls?: DateRangeControls;
	onChange: (dateRange: { gte: string; lte: string }, id: string) => void;
}

export interface DateRange {
	gte: string;
	lte: string;
}

export type DateRangeControls = 'year' | 'date' | 'past' | 'future';

const DEFAULT_DATE_RANGE = { gte: '', lte: '' };
const DEFAULT_PAST_DATE_RANGE = {
	gte: '',
	lte: new Date().toISOString(),
};
const DEFAULT_FUTURE_DATE_RANGE = {
	gte: new Date().toISOString(),
	lte: '',
};

const DateRangeDropdown: FunctionComponent<DateRangeDropdownProps> = ({
	label,
	id,
	range = DEFAULT_DATE_RANGE,
	showPastFutureOptions = false,
	defaultControls = 'year',
	onChange,
}) => {
	const [t] = useTranslation();

	// Internal range state (copied to external range state when the user clicks on the apply button
	const [rangeState, setRangeState] = useState<DateRange>(range);
	const [dateControls, setDateControls] = useState<DateRangeControls>(defaultControls);
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
	const [yearInputGte, setYearInputGte] = useState<string>('');
	const [yearInputLte, setYearInputLte] = useState<string>('');

	// @ts-ignore
	const resetInternalRangeState = async (tagId?: ReactText, evt?: MouseEvent): Promise<void> => {
		evt && evt.stopPropagation();
		setRangeState(range);
	};

	useEffect(() => {
		if (dateControls === 'year') {
			// Round selected dates to the larger year
			setRangeState((oldRangeState) => {
				setYearInputGte(oldRangeState.gte ? oldRangeState.gte.split('-')[0] : '');
				setYearInputLte(oldRangeState.lte ? oldRangeState.lte.split('-')[0] : '');
				return {
					gte: oldRangeState.gte ? `${oldRangeState.gte.split('-')[0]}-01-01` : '',
					lte: oldRangeState.lte ? `${oldRangeState.lte.split('-')[0]}-12-31` : '',
				};
			});
		} else if (dateControls === 'past') {
			setRangeState(DEFAULT_PAST_DATE_RANGE);
		} else if (dateControls === 'future') {
			setRangeState(DEFAULT_FUTURE_DATE_RANGE);
		}
	}, [dateControls]);

	/**
	 * State is only passed from the component to the parent when the user clicks the "Apply" button
	 */
	const applyFilter = async (): Promise<void> => {
		onChange(rangeState, id);
		await closeDropdown();
	};

	// @ts-ignore
	const removeFilter = (tagId: ReactText, evt: MouseEvent) => {
		evt.stopPropagation();
		setRangeState(DEFAULT_DATE_RANGE);
		setYearInputGte('');
		setYearInputLte('');
		onChange(DEFAULT_DATE_RANGE, id);
	};

	const handleDateChange = async (date: Date | null, rangeId: 'gte' | 'lte') => {
		if (date) {
			let dateMoment: moment.Moment;
			if (rangeId === 'gte') {
				dateMoment = moment(date).set({ hour: 0, minute: 0, second: 0 });
			} else {
				dateMoment = moment(date).set({ hour: 23, minute: 59, second: 59 });
			}
			setRangeState({
				...rangeState,
				[rangeId]: dateMoment.format('YYYY-MM-DD HH:mm:ss'),
			});
		} else {
			setRangeState({
				...rangeState,
				[rangeId]: '',
			});
		}
	};

	const handleYearInputChange = async (value: string, rangeId: 'gte' | 'lte') => {
		try {
			rangeId === 'gte' ? setYearInputGte(value) : setYearInputLte(value);
			if (value.match(/^[0-9]{4}$/g)) {
				await handleDateChange(
					new Date(
						parseInt(value, 10),
						rangeId === 'gte' ? 0 : 11,
						rangeId === 'gte' ? 1 : 31
					),
					rangeId
				);
			} else {
				await handleDateChange(null, rangeId);
			}
		} catch (err) {
			ToastService.danger(
				`${t(
					'shared/components/date-range-dropdown/date-range-dropdown___ongeldig-jaar'
				)} ${value}`
			);
		}
	};

	const openDropdown = async () => {
		await resetInternalRangeState();
		setIsDropdownOpen(true);
	};

	const closeDropdown = () => setIsDropdownOpen(false);

	const getTag = () => {
		const { gte, lte } = range;
		const isGteStartOfYear = gte.includes('-01-01');
		const isLteEndOfYear = lte.includes('-12-31');
		const gteFormattedDate = reorderDate(gte);
		const lteFormattedDate = reorderDate(lte);
		const gteYear = gte.split('-')[0];
		const lteYear = lte.split('-')[0];
		let tagLabel: string | null = null;

		if (gte && lte) {
			if (isGteStartOfYear && isLteEndOfYear) {
				// only show years
				tagLabel = `${gteYear} - ${lteYear}`;
			} else {
				// show full dates
				tagLabel = `${reorderDate(gte)} - ${reorderDate(lte)}`;
			}
		} else if (gte) {
			tagLabel = `na ${isGteStartOfYear ? gteYear : gteFormattedDate}`;
		} else if (lte) {
			tagLabel = `voor ${isLteEndOfYear ? lteYear : lteFormattedDate}`;
		}

		if (tagLabel) {
			return [
				{
					label: tagLabel,
					id: 'date',
				},
			];
		}

		return []; // Do not render a filter if date object is empty: {gte: "", lte: ""}
	};

	let dateRange = rangeState;
	if (dateControls === 'past') {
		dateRange = DEFAULT_PAST_DATE_RANGE;
	}
	if (dateControls === 'future') {
		dateRange = DEFAULT_FUTURE_DATE_RANGE;
	}
	const from = dateRange.gte;
	const till = dateRange.lte;
	let fromYear: string;
	let tillYear: string;

	// Get year from state or yearInputString
	if (dateControls === 'year') {
		fromYear = (yearInputGte || from || '').split('-')[0];
		tillYear = (yearInputLte || till || '').split('-')[0];
	} else {
		fromYear = (from || yearInputGte || '').split('-')[0];
		tillYear = (till || yearInputLte || '').split('-')[0];
	}

	const fromDate: Date | null = from ? moment(from, 'YYYY-MM-DD HH:mm:ss').toDate() : null;
	const tillDate: Date | null = till ? moment(till, 'YYYY-MM-DD HH:mm:ss').toDate() : null;

	return (
		<Dropdown
			label={label}
			menuWidth="fit-content"
			isOpen={isDropdownOpen}
			onOpen={openDropdown}
			onClose={closeDropdown}
		>
			<DropdownButton>
				{renderDropdownButton(label, isDropdownOpen, getTag(), removeFilter)}
			</DropdownButton>
			<DropdownContent>
				<Spacer className="c-date-range-dropdown__content">
					<Form>
						<FormGroup
							label={t(
								'shared/components/date-range-dropdown/date-range-dropdown___hoe-specifiek'
							)}
						>
							<RadioButtonGroup
								inline={!showPastFutureOptions}
								options={[
									{
										label: t(
											'shared/components/date-range-dropdown/date-range-dropdown___op-jaartal'
										),
										value: 'year',
									},
									{
										label: t(
											'shared/components/date-range-dropdown/date-range-dropdown___specifieke-datums'
										),
										value: 'date',
									},
									...(showPastFutureOptions
										? [
												{
													label: t(
														'shared/components/date-range-dropdown/date-range-dropdown___in-het-verleden'
													),
													value: 'past',
												},
												{
													label: t(
														'shared/components/date-range-dropdown/date-range-dropdown___in-de-toekomst'
													),
													value: 'future',
												},
										  ]
										: []),
								]}
								value={dateControls}
								onChange={(value) => setDateControls(value as DateRangeControls)}
							/>
							{dateControls === 'year' && (
								<Grid>
									<Column size="6">
										<FormGroup
											label={t(
												'shared/components/date-range-dropdown/date-range-dropdown___van'
											)}
										>
											<TextInput
												id={`${id}-gte`}
												placeholder={t(
													'shared/components/date-range-dropdown/date-range-dropdown___jjjj'
												)}
												value={fromYear}
												onChange={(value: string) =>
													handleYearInputChange(value, 'gte')
												}
											/>
										</FormGroup>
									</Column>
									<Column size="6">
										<FormGroup
											label={t(
												'shared/components/date-range-dropdown/date-range-dropdown___tot'
											)}
										>
											<TextInput
												id={`${id}-lte`}
												placeholder={t(
													'shared/components/date-range-dropdown/date-range-dropdown___jjjj'
												)}
												value={tillYear}
												onChange={(value: string) =>
													handleYearInputChange(value, 'lte')
												}
											/>
										</FormGroup>
									</Column>
								</Grid>
							)}
							{(dateControls === 'date' ||
								dateControls === 'past' ||
								dateControls === 'future') && (
								<Grid>
									<Column size="6">
										<FormGroup
											label={t(
												'shared/components/date-range-dropdown/date-range-dropdown___van'
											)}
										>
											<DatePicker
												value={fromDate}
												onChange={(value) => handleDateChange(value, 'gte')}
												disabled={dateControls !== 'date'}
											/>
										</FormGroup>
									</Column>
									<Column size="6">
										<FormGroup
											label={t(
												'shared/components/date-range-dropdown/date-range-dropdown___tot'
											)}
										>
											<DatePicker
												value={tillDate}
												onChange={(value) => handleDateChange(value, 'lte')}
												disabled={dateControls !== 'date'}
											/>
										</FormGroup>
									</Column>
								</Grid>
							)}
						</FormGroup>
						<FormGroup>
							<Button
								label={t(
									'shared/components/date-range-dropdown/date-range-dropdown___toepassen'
								)}
								type="primary"
								className="c-apply-filter-button"
								block
								onClick={applyFilter}
							/>
						</FormGroup>
					</Form>
				</Spacer>
			</DropdownContent>
		</Dropdown>
	);
};

export default DateRangeDropdown;
