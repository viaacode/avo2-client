import React, { FunctionComponent, ReactNode } from 'react';

import { Avo } from '@viaa/avo2-types';
import { capitalize, get } from 'lodash-es';

import { CheckboxDropdownModal, DateRangeDropdown } from '../../shared/components';
import { CheckboxOption } from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { LANGUAGES } from '../../shared/constants';
import { SearchFilterControlsProps } from '../search.types';

import './SearchFilterControls.scss';

const languageCodeToLabel = (code: string): string => {
	return capitalize(LANGUAGES.nl[code]) || code;
};

const SearchFilterControls: FunctionComponent<SearchFilterControlsProps> = ({
	formState,
	handleFilterFieldChange,
	multiOptions,
}) => {
	const renderCheckboxDropdownModal = (
		label: string,
		propertyName: Avo.Search.FilterProp,
		disabled: boolean = false
	): ReactNode => {
		const checkboxMultiOptions = (multiOptions[propertyName] || []).map(
			({ option_name, option_count }: Avo.Search.OptionProp): CheckboxOption => {
				let checkboxLabel = capitalize(option_name);

				if (propertyName === 'language') {
					checkboxLabel = languageCodeToLabel(option_name);
				}

				return {
					label: checkboxLabel,
					optionCount: option_count,
					id: option_name,
					checked: ((formState[propertyName] as string[]) || []).includes(option_name),
				};
			}
		);

		return (
			<li className={`c-filter-dropdown c-filter-dropdown-${propertyName.toLowerCase()}`}>
				<CheckboxDropdownModal
					label={label}
					id={propertyName as string}
					options={checkboxMultiOptions}
					disabled={disabled}
					onChange={async (values: string[]) => {
						await handleFilterFieldChange(values, propertyName);
					}}
				/>
			</li>
		);
	};

	const renderDateRangeDropdown = (
		label: string,
		propertyName: Avo.Search.FilterProp
	): ReactNode => {
		const range: Avo.Search.DateRange = get(formState, 'broadcastDate') || {
			gte: '',
			lte: '',
		};
		const correctRange: Avo.Search.DateRange = {
			gte: range.gte || '',
			lte: range.lte || '',
		};

		return (
			<li className={`c-filter-dropdown c-filter-dropdown-${propertyName.toLowerCase()}`}>
				<DateRangeDropdown
					label={label}
					id={propertyName}
					range={correctRange as { gte: string; lte: string }}
					onChange={async (dateRange: Avo.Search.DateRange) =>
						await handleFilterFieldChange(dateRange, propertyName)
					}
				/>
			</li>
		);
	};

	return (
		<ul className="c-filter-dropdown-list">
			{renderCheckboxDropdownModal('Type', 'type')}
			{renderCheckboxDropdownModal('Onderwijsniveau', 'educationLevel')}
			{renderCheckboxDropdownModal('Domein', 'domain', true)}
			{renderCheckboxDropdownModal('Vak', 'subject')}
			{renderCheckboxDropdownModal('Trefwoord', 'keyword')}
			{renderCheckboxDropdownModal('Serie', 'serie')}
			{renderDateRangeDropdown('Uitzenddatum', 'broadcastDate')}
			{renderCheckboxDropdownModal('Taal', 'language')}
			{renderCheckboxDropdownModal('Aanbieder', 'provider', false)}
		</ul>
	);
};

export default SearchFilterControls;
