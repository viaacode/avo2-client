import { get } from 'lodash';
import { compact } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Column,
	FormGroup,
	Grid,
	LabelObj,
	Select,
	SelectOption,
	TagInfo,
	TagsInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ToastService } from '../../../../shared/services';
import { ContentService } from '../../../content/content.service';
import { ContentPageType } from '../../../content/content.types';
import { useContentTypes } from '../../../content/hooks';

export interface ContentTypeAndLabelsValue {
	selectedContentType: ContentPageType;
	selectedLabels: Avo.Content.ContentLabel[];
}

export interface ContentTypeAndLabelsProps {
	value?: ContentTypeAndLabelsValue;
	onChange: (value: ContentTypeAndLabelsValue) => void;
	errors: string[];
}

export const ContentTypeAndLabelsPicker: FunctionComponent<ContentTypeAndLabelsProps> = ({
	value = {
		selectedContentType: 'PROJECT',
		selectedLabels: [],
	},
	onChange,
	errors,
}) => {
	const [t] = useTranslation();

	const [contentTypes, isLoadingContentTypes] = useContentTypes();
	const [labels, setLabels] = useState<Avo.Content.ContentLabel[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);
		ContentService.fetchLabelsByContentType(value.selectedContentType)
			.then(setLabels)
			.catch((err: any) => {
				console.error('Failed to get content labels in ContentTypeAndLabelsPicker', err, {
					selectedContentType: value.selectedContentType,
				});
				ToastService.danger(t('Het ophalen van de content pagina labels is mislukt'));
			})
			.finally(() => setIsLoading(false));
	}, [value.selectedContentType, setLabels, t]);

	const handleContentTypeChanged = (selectedValue: string) => {
		onChange({
			selectedContentType: selectedValue as ContentPageType,
			selectedLabels: get(value, 'selectedLabels', []),
		});
	};

	const handleLabelsChanged = (newSelectedLabels: TagInfo[]) => {
		onChange({
			selectedContentType: get(value, 'selectedContentType') as ContentPageType,
			selectedLabels: compact(
				(newSelectedLabels || []).map(selectedLabel =>
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
				<Select
					id="content-type-and-label-picker-type"
					placeholder={t('admin/content/components/content-picker/content-picker___type')}
					options={contentTypes}
					value={get(value, 'selectedContentType')}
					loading={isLoadingContentTypes}
					onChange={handleContentTypeChanged}
				/>
			</Column>
			<Column size="3">
				<TagsInput
					options={(labels || []).map(
						(labelObj): SelectOption<number> => ({
							label: labelObj.label,
							value: labelObj.id,
						})
					)}
					allowMulti
					allowCreate={false}
					value={compact(
						((value.selectedLabels || []) as LabelObj[]).map(
							(labelObj: LabelObj): SelectOption<number> => ({
								label: labelObj.label,
								value: labelObj.id,
							})
						)
					)}
					onChange={handleLabelsChanged}
					disabled={!value || !value.selectedContentType}
					isLoading={isLoading}
					placeholder={
						!value || !value.selectedContentType
							? t('Kies eerst een content type')
							: t(
									'admin/shared/components/content-type-and-labels-picker/content-type-and-labels-picker___labels'
							  )
					}
				/>
			</Column>
		</Grid>
	);

	return <FormGroup error={errors}>{renderSelectPicker()}</FormGroup>;
};
