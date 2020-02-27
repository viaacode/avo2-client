import React, { FunctionComponent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	Flex,
	Form,
	FormGroup,
	SelectOption,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';

import { CheckboxDropdownModal, DateRangeDropdown } from '../../../../shared/components';
import { KeyCode } from '../../../../shared/types';

import { ContentFilterFormState, ContentPageType } from '../../content.types';
import './ContentFilters.scss';

interface ContentFiltersProps {
	contentTypes: SelectOption<ContentPageType>[];
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
	const contentTypeOptions = contentTypes.map(option => ({
		label: option.label,
		id: option.value,
		checked: formState.contentType.includes(option.value),
	}));

	// Methods
	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.keyCode === KeyCode.Enter) {
			onFilterChange('query', query);
		}
	};

	// Render
	return (
		<Spacer className="c-content-filters" margin="bottom-small">
			<Spacer margin="bottom">
				<Form type="inline">
					<FormGroup className="c-content-filters__search" inlineMode="grow">
						<TextInput
							placeholder={t(
								'admin/content/components/content-filters/content-filters___zoek-op-auteur-titel'
							)}
							icon="search"
							onChange={onQueryChange}
							onKeyUp={handleKeyUp}
							value={query}
						/>
					</FormGroup>
					<FormGroup inlineMode="shrink">
						<Button
							label={t(
								'admin/content/components/content-filters/content-filters___zoeken'
							)}
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
					label={t('admin/content/components/content-filters/content-filters___type')}
					onChange={value => onFilterChange('contentType', value)}
					options={contentTypeOptions}
				/>
				<DateRangeDropdown
					id="content-filter-created-date"
					label={t(
						'admin/content/components/content-filters/content-filters___aanmaakdatum'
					)}
					onChange={value => onFilterChange('createdDate', value)}
					range={formState.createdDate}
				/>
				<DateRangeDropdown
					id="content-filter-updated-date"
					label={t(
						'admin/content/components/content-filters/content-filters___bewerkdatum'
					)}
					onChange={value => onFilterChange('updatedDate', value)}
					range={formState.updatedDate}
				/>
				<DateRangeDropdown
					id="content-filter-publish-date"
					label={t(
						'admin/content/components/content-filters/content-filters___publiceerdatum'
					)}
					onChange={value => onFilterChange('publishDate', value)}
					range={formState.publishDate}
				/>
				<DateRangeDropdown
					id="content-filter-depublish-date"
					label={t(
						'admin/content/components/content-filters/content-filters___depubliceerdatum'
					)}
					onChange={value => onFilterChange('depublishDate', value)}
					range={formState.depublishDate}
				/>
			</Flex>
		</Spacer>
	);
};

export default ContentFilters;
