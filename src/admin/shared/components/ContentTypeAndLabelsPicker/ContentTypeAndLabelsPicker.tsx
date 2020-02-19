import { get } from 'lodash';
import { compact } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import { ValueType } from 'react-select/src/types';

import { Column, FormGroup, Grid, LabelObj, SelectOption } from '@viaa/avo2-components';

import { ContentPageType } from '../../../content/content.types';
import { useContentTypes } from '../../../content/hooks';
import { REACT_SELECT_DEFAULT_OPTIONS } from '../ContentPicker/ContentPicker';

export interface ContentTypeAndLabelsValue {
	selectedContentType: ContentPageType;
	selectedLabels: ContentLabel[];
}

export interface ContentLabel {
	id: number;
	label: string;
	content_type: string;
	created_at: string;
	updated_at: string;
}

export interface ContentPickerProps {
	value?: ContentTypeAndLabelsValue;
	onChange: (value: ContentTypeAndLabelsValue) => void;
	errors: string[];
}

const ContentTypeAndLabelsPicker: FunctionComponent<ContentPickerProps> = ({
	value = {
		selectedContentType: 'PROJECT',
		selectedLabels: [],
	},
	onChange,
	errors,
}) => {
	const [t] = useTranslation();

	const [contentTypes, isLoadingContentTypes] = useContentTypes();
	const [labels, setLabels] = useState<ContentLabel[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);
		setLabels(
			[
				`${value.selectedContentType}-test1`,
				`${value.selectedContentType}-test2`,
				`${value.selectedContentType}-test3`,
			].map(
				(label, index): ContentLabel => ({
					label,
					id: index,
					content_type: value.selectedContentType,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
			)
		);
		setIsLoading(false);
		// TODO implement once added to the database
		// dataService
		// 	.query({
		// 		query: GET_LABELS_FOR_CONTENT_TYPE,
		// 	})
		// 	.then(response => {
		// 		const types: string[] = get(response, 'data.lookup_enum_content_types', []).map(
		// 			(type: { value: string }) => type.value
		// 		);
		// 		setContentTypes(types);
		// 	})
		// 	.catch(err => {
		// 		console.error('Failed to get content types in ContentTypeAndLabelsPicker', err, {
		// 			query: 'GET_CONTENT_TYPES',
		// 		});
		// 		toastService.danger(t('Het ophalen van de content pagina types is mislukt'));
		// 	})
		//  .finally(() => setIsLoading(false));
	}, [value.selectedContentType, setLabels, t]);

	const handleContentTypeChanged = (selectedItem: ValueType<SelectOption<ContentPageType>>) => {
		onChange({
			selectedContentType: get(selectedItem, 'value'),
			selectedLabels: get(value, 'selectedLabels', []),
		});
	};

	const handleLabelsChanged = (newSelectedLabels: SelectOption<number>[]) => {
		onChange({
			selectedContentType: get(value, 'selectedContentType') as ContentPageType,
			selectedLabels: compact(
				(newSelectedLabels || []).map((selectedLabel: SelectOption<number>) =>
					(labels || []).find(labelObj => {
						return labelObj.id === get(selectedLabel, 'value');
					})
				)
			),
		});
	};

	const renderSelectPicker = () => (
		<Grid>
			<Column size="1">
				<ReactSelect
					{...REACT_SELECT_DEFAULT_OPTIONS}
					id="content-type-and-label-picker-type"
					placeholder={t('admin/content/components/content-picker/content-picker___type')}
					options={contentTypes}
					isSearchable
					isMulti={false}
					isLoading={isLoadingContentTypes}
					onChange={handleContentTypeChanged}
				/>
			</Column>
			<Column size="3">
				<ReactSelect
					{...REACT_SELECT_DEFAULT_OPTIONS}
					id="content-type-and-label-picker-label"
					placeholder={t('Labels')}
					options={(labels || []).map(
						(labelObj): SelectOption<number> => ({ label: labelObj.label, value: labelObj.id })
					)}
					value={compact(
						((value.selectedLabels || []) as LabelObj[]).map(
							(labelObj: LabelObj): SelectOption<number> => ({
								label: labelObj.label,
								value: labelObj.id,
							})
						)
					)}
					isSearchable
					isMulti
					isLoading={isLoading}
					onChange={handleLabelsChanged as any}
				/>
			</Column>
		</Grid>
	);

	return <FormGroup error={errors}>{renderSelectPicker()}</FormGroup>;
};

export default ContentTypeAndLabelsPicker;
