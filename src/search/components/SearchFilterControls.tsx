import { get } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avo } from '@viaa/avo2-types';

import { CollectionService } from '../../collection/collection.service';
import { CheckboxDropdownModal, CheckboxOption, DateRangeDropdown } from '../../shared/components';
import { LANGUAGES } from '../../shared/constants';
import { CustomError } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { SearchFilterControlsProps } from '../search.types';

import './SearchFilterControls.scss';

const languageCodeToLabel = (code: string): string => {
	return LANGUAGES.nl[code] || code;
};

const SearchFilterControls: FunctionComponent<SearchFilterControlsProps> = ({
	formState,
	handleFilterFieldChange,
	multiOptions,
}) => {
	const [t] = useTranslation();

	const [collectionLabels, setCollectionLabels] = useState<{ [id: string]: string }>({});

	useEffect(() => {
		CollectionService.getCollectionLabels()
			.then(setCollectionLabels)
			.catch(err => {
				console.error(new CustomError('Failed to get collection labels', err));
				ToastService.danger(
					t(
						'search/components/search-filter-controls___het-ophalen-van-de-kwaliteitslabels-is-mislukt'
					)
				);
			});
	}, [setCollectionLabels, t]);

	const renderCheckboxDropdownModal = (
		label: string,
		propertyName: Avo.Search.FilterProp,
		disabled: boolean = false,
		labelsMapping?: { [id: string]: string }
	): ReactNode => {
		const checkboxMultiOptions = (multiOptions[propertyName] || []).map(
			({ option_name, option_count }: Avo.Search.OptionProp): CheckboxOption => {
				let checkboxLabel = option_name;

				if (propertyName === 'language') {
					checkboxLabel = languageCodeToLabel(option_name);
				}

				if (labelsMapping) {
					checkboxLabel = labelsMapping[option_name];
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
			{renderCheckboxDropdownModal(
				t('search/components/search-filter-controls___type'),
				'type'
			)}
			{renderCheckboxDropdownModal(
				t('search/components/search-filter-controls___onderwijsniveau'),
				'educationLevel'
			)}
			{/*{renderCheckboxDropdownModal( TODO: DISABLED FEATURE */}
			{/*	t('search/components/search-filter-controls___domein'),*/}
			{/*	'domain',*/}
			{/*)}*/}
			{renderCheckboxDropdownModal(
				t('search/components/search-filter-controls___vak'),
				'subject'
			)}
			{renderCheckboxDropdownModal(
				t('search/components/search-filter-controls___trefwoord'),
				'keyword'
			)}
			{renderCheckboxDropdownModal(
				t('search/components/search-filter-controls___serie'),
				'serie'
			)}
			{renderDateRangeDropdown(
				t('search/components/search-filter-controls___uitzenddatum'),
				'broadcastDate'
			)}
			{renderCheckboxDropdownModal(
				t('search/components/search-filter-controls___taal'),
				'language'
			)}
			{renderCheckboxDropdownModal(
				t('search/components/search-filter-controls___aanbieder'),
				'provider'
			)}
			{renderCheckboxDropdownModal(
				t('search/components/search-filter-controls___label'),
				'collectionLabel',
				false,
				collectionLabels
			)}
		</ul>
	);
};

export default SearchFilterControls;
