import React, { ReactNode } from 'react';

import { Avo } from '@viaa/avo2-types';
import { capitalize, get } from 'lodash-es';

import {
	CheckboxDropdownModal,
	CheckboxOption,
} from '../../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { DateRangeDropdown } from '../../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { LANGUAGES } from '../../../shared/helpers/languages';
import { SearchFilterControlsProps } from './types';

const languageCodeToLabel = (code: string): string => {
	return capitalize(LANGUAGES.nl[code]) || code;
};

const SearchFilterControls = ({
	formState,
	handleFilterFieldChange,
	multiOptions,
}: SearchFilterControlsProps) => {
	const renderCheckboxDropdownModal = (
		label: string,
		propertyName: Avo.Search.FilterProp,
		disabled: boolean = false
	): ReactNode => {
		const checkboxMultiOptions = (multiOptions[propertyName] || []).map(
			(option: Avo.Search.OptionProp): CheckboxOption => {
				let label = capitalize(option.option_name);

				if (propertyName === 'language') {
					label = languageCodeToLabel(option.option_name);
				}

				return {
					label,
					optionCount: option.option_count,
					id: option.option_name,
					checked: ((formState[propertyName] as string[]) || []).includes(option.option_name),
				};
			}
		);

		return (
			<li className="c-filter-dropdown">
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
		const range: Avo.Search.DateRange = get(formState, 'broadcastDate') || { gte: '', lte: '' };
		range.gte = range.gte || '';
		range.lte = range.lte || '';

		return (
			<li className="c-filter-dropdown">
				<DateRangeDropdown
					label={label}
					id={propertyName}
					range={range as { gte: string; lte: string }}
					onChange={async (range: Avo.Search.DateRange) => {
						await handleFilterFieldChange(range, propertyName);
					}}
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
