import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { TextInput, Toolbar, ToolbarItem, ToolbarLeft, ToolbarRight } from '@viaa/avo2-components';

import { CheckboxDropdownModal, DateRangeDropdown } from '../../../../shared/components';
import { DateRange } from '../../../../shared/components/DateRangeDropdown/DateRangeDropdown';

import {
	ContentFilterDateRangeKeys,
	ContentFilterFormState,
	ContentTypesResponse,
} from '../../content.types';

interface ContentFiltersProps {
	contentTypes: ContentTypesResponse[];
	formState: ContentFilterFormState;
	onChange: <K extends keyof ContentFilterFormState>(
		key: K,
		value: ContentFilterFormState[K]
	) => void;
}

// TODO: this query should be able to
// - filter on: title, description, author, role, all dates and content type
// - order by

const ContentFilters: FunctionComponent<ContentFiltersProps> = ({
	contentTypes,
	formState,
	onChange,
}) => {
	// Hooks
	const [t] = useTranslation();
	// Computed
	const contentTypeOptions = contentTypes.map(({ value }) => ({
		checked: false,
		id: value,
		label: value,
	}));

	// Methods
	const handleDateRangeChange = (key: ContentFilterDateRangeKeys, range: DateRange) => {
		const updatedDateRanges = {
			...formState.dateRanges,
			[key]: range,
		};

		onChange('dateRanges', updatedDateRanges);
	};

	// Render
	return (
		<Toolbar>
			<ToolbarLeft>
				<ToolbarItem>
					<CheckboxDropdownModal
						id="content-filter-type"
						label={t('Type')}
						onChange={value => onChange('contentType', value)}
						options={contentTypeOptions}
					/>
				</ToolbarItem>
				<ToolbarItem>
					<DateRangeDropdown
						id="content-filter-created-date"
						label={t('Aanmaakdatum')}
						onChange={value => handleDateRangeChange('created', value)}
						range={formState.dateRanges.created}
					/>
				</ToolbarItem>
				<ToolbarItem>
					<DateRangeDropdown
						id="content-filter-updated-date"
						label={t('Bewerkdatum')}
						onChange={value => handleDateRangeChange('updated', value)}
						range={formState.dateRanges.updated}
					/>
				</ToolbarItem>
				<ToolbarItem>
					<DateRangeDropdown
						id="content-filter-publish-date"
						label={t('Publiceerdatum')}
						onChange={value => handleDateRangeChange('publish', value)}
						range={formState.dateRanges.publish}
					/>
				</ToolbarItem>
				<ToolbarItem>
					<DateRangeDropdown
						id="content-filter-depublish-date"
						label={t('Depubliceerdatum')}
						onChange={value => handleDateRangeChange('depublish', value)}
						range={formState.dateRanges.depublish}
					/>
				</ToolbarItem>
			</ToolbarLeft>
			<ToolbarRight>
				<ToolbarItem>
					<TextInput
						placeholder="Zoek op auteur, titel"
						icon="search"
						onChange={value => onChange('text', value)}
						value={formState.text}
					/>
				</ToolbarItem>
			</ToolbarRight>
		</Toolbar>
	);
};

export default ContentFilters;
