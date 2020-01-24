import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Flex, Form, FormGroup, Spacer, TextInput } from '@viaa/avo2-components';

import { CheckboxDropdownModal, DateRangeDropdown } from '../../../../shared/components';

import { ContentFilterFormState, ContentTypesResponse } from '../../content.types';
import './ContentFilters.scss';

interface ContentFiltersProps {
	contentTypes: ContentTypesResponse[];
	formState: ContentFilterFormState;
	hasFilters: boolean;
	onClearFilters: () => void;
	onFilterChange: <K extends keyof ContentFilterFormState>(
		key: K,
		value: ContentFilterFormState[K]
	) => void;
	onQueryChange: (query: string) => void;
	query: string;
}

const ContentFilters: FunctionComponent<ContentFiltersProps> = ({
	contentTypes,
	formState,
	hasFilters,
	onClearFilters,
	onFilterChange,
	onQueryChange,
	query,
}) => {
	// Hooks
	const [t] = useTranslation();

	// Computed
	const contentTypeOptions = contentTypes.map(({ value }) => ({
		checked: formState.contentType.includes(value),
		id: value,
		label: value,
	}));

	// Render
	return (
		<Spacer className="c-content-filters" margin="bottom-small">
			<Spacer margin="bottom">
				<Form type="inline">
					<FormGroup className="c-content-filters__search" inlineMode="grow">
						<TextInput
							placeholder="Zoek op auteur, titel"
							icon="search"
							onChange={onQueryChange}
							value={query}
						/>
					</FormGroup>
					<FormGroup inlineMode="shrink">
						<Button
							label={t('Zoeken')}
							type="primary"
							onClick={() => onFilterChange('query', query)}
						/>
					</FormGroup>
					{hasFilters && (
						<FormGroup inlineMode="shrink">
							<Button
								label={t('search/views/search___verwijder-alle-filters')}
								type="link"
								onClick={onClearFilters}
							/>
						</FormGroup>
					)}
				</Form>
			</Spacer>
			<Flex spaced="regular" wrap>
				<CheckboxDropdownModal
					id="content-filter-type"
					label={t('Type')}
					onChange={value => onFilterChange('contentType', value)}
					options={contentTypeOptions}
				/>
				<DateRangeDropdown
					id="content-filter-created-date"
					label={t('Aanmaakdatum')}
					onChange={value => onFilterChange('createdDate', value)}
					range={formState.createdDate}
				/>
				<DateRangeDropdown
					id="content-filter-updated-date"
					label={t('Bewerkdatum')}
					onChange={value => onFilterChange('updatedDate', value)}
					range={formState.updatedDate}
				/>
				<DateRangeDropdown
					id="content-filter-publish-date"
					label={t('Publiceerdatum')}
					onChange={value => onFilterChange('publishDate', value)}
					range={formState.publishDate}
				/>
				<DateRangeDropdown
					id="content-filter-depublish-date"
					label={t('Depubliceerdatum')}
					onChange={value => onFilterChange('depublishDate', value)}
					range={formState.depublishDate}
				/>
			</Flex>
		</Spacer>
	);
};

export default ContentFilters;
