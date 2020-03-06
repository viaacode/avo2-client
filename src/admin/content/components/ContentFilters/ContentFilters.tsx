import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Flex, Form, FormGroup, Spacer } from '@viaa/avo2-components';

import { CheckboxDropdownModal, DateRangeDropdown } from '../../../../shared/components';
import { DateRange } from '../../../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { DateRangeParam } from '../../../shared/helpers/query-string-converters';

import { DelimitedArrayParam, StringParam, useQueryParam } from 'use-query-params';
import { useContentTypes } from '../../hooks';
import './ContentFilters.scss';

interface ContentFiltersProps {
	onFiltersChange: (filters: Partial<any>) => void;
}

const ContentFilters: FunctionComponent<ContentFiltersProps> = ({ onFiltersChange }) => {
	// Hooks
	const [t] = useTranslation();
	const [contentTypes] = useContentTypes();

	const [contentType, setContentType] = useQueryParam<string[] | undefined>(
		'contentType',
		DelimitedArrayParam
	);
	const [createdDate, setCreatedDate] = useQueryParam<DateRange | undefined>(
		'createdDate',
		DateRangeParam
	);
	const [updatedDate, setUpdatedDate] = useQueryParam<DateRange | undefined>(
		'updatedDate',
		DateRangeParam
	);
	const [publishDate, setPublishDate] = useQueryParam<DateRange | undefined>(
		'publishDate',
		DateRangeParam
	);
	const [depublishDate, setDepublishDate] = useQueryParam<DateRange | undefined>(
		'depublishDate',
		DateRangeParam
	);
	const [query, setQuery] = useQueryParam<string | undefined>('query', StringParam);
	// Holds the text while the user is typing, once they press the search button or enter it will be copied to the query prop
	// This avoids doing a database query on every key press
	const [searchTerm, setSearchTerm] = useState<string>('');

	// Computed
	const contentTypeOptions = contentTypes.map(option => ({
		label: option.label,
		id: option.value,
		checked: (contentType || []).includes(option.value),
	}));

	useEffect(() => {
		onFiltersChange({
			...(contentType ? { contentType } : {}),
			...(createdDate ? { createdDate } : {}),
			...(updatedDate ? { updatedDate } : {}),
			...(publishDate ? { publishDate } : {}),
			...(depublishDate ? { depublishDate } : {}),
			...(searchTerm ? { query: searchTerm } : {}),
		});
	}, [contentType, createdDate, updatedDate, publishDate, depublishDate, query]);

	// Methods
	const clearFilters = () => {
		setSearchTerm('');
		setContentType(undefined);
		setCreatedDate(undefined);
		setUpdatedDate(undefined);
		setPublishDate(undefined);
		setDepublishDate(undefined);
		setQuery('');
	};

	const hasFilters = () => {
		return contentType || createdDate || updatedDate || publishDate || depublishDate || query;
	};

	// Render
	return (
		<Spacer className="c-content-filters" margin="bottom-small">
			<Spacer margin="bottom">
				<Form type="inline">
					{hasFilters() && (
						<FormGroup inlineMode="shrink">
							<Button
								label={t('search/views/search___verwijder-alle-filters')}
								type="link"
								onClick={clearFilters}
							/>
						</FormGroup>
					)}
				</Form>
			</Spacer>
			<Flex spaced="regular" wrap>
				<CheckboxDropdownModal
					id="content-filter-type"
					label={t('admin/content/components/content-filters/content-filters___type')}
					onChange={value => setContentType(value)}
					options={contentTypeOptions}
				/>
				<DateRangeDropdown
					id="content-filter-created-date"
					label={t(
						'admin/content/components/content-filters/content-filters___aanmaakdatum'
					)}
					onChange={value => setCreatedDate(value)}
					range={createdDate}
				/>
				<DateRangeDropdown
					id="content-filter-updated-date"
					label={t(
						'admin/content/components/content-filters/content-filters___bewerkdatum'
					)}
					onChange={value => setUpdatedDate(value)}
					range={updatedDate}
				/>
				<DateRangeDropdown
					id="content-filter-publish-date"
					label={t(
						'admin/content/components/content-filters/content-filters___publiceerdatum'
					)}
					onChange={value => setPublishDate(value)}
					range={publishDate}
				/>
				<DateRangeDropdown
					id="content-filter-depublish-date"
					label={t(
						'admin/content/components/content-filters/content-filters___depubliceerdatum'
					)}
					onChange={value => setDepublishDate(value)}
					range={depublishDate}
				/>
			</Flex>
		</Spacer>
	);
};

export default ContentFilters;
