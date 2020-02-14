import { get } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect, { ActionMeta } from 'react-select';
import { ValueType } from 'react-select/src/types';

import {
	Column,
	Flex,
	FormGroup,
	Grid,
	RadioButton,
	RadioButtonGroup,
	Select,
	SelectOption,
	TextInput,
} from '@viaa/avo2-components';
import { dataService } from '../../../../shared/services/data-service';
import toastService from '../../../../shared/services/toast-service';
import { ContentTypeOption } from '../../../content-block/content-block.types';
import { GET_CONTENT_TYPES } from '../../../content/content.gql';
import { PickerItem } from '../../../shared/types';
import { REACT_SELECT_DEFAULT_OPTIONS } from '../ContentPicker/ContentPicker';

export interface ContentLabel {
	id: number;
	label: string;
	content_type: string;
	created_at: string;
	updated_at: string;
}

export interface ContentPickerProps {
	selectedContentType: ContentTypeOption;
	onSelectedContentTypeChanged: (contentTypes: ContentTypeOption) => void;
	selectedLabels: ContentLabel[];
	onSelectedLabelsChanged: (labels: ContentLabel[]) => void;
}

const ContentTypeAndLabelsPicker: FunctionComponent<ContentPickerProps> = ({
	selectedContentType,
	onSelectedContentTypeChanged,
	selectedLabels,
	onSelectedLabelsChanged,
}) => {
	const [t] = useTranslation();

	const [contentTypes, setContentTypes] = useState<ContentTypeOption>([]);
	const [labels, setLabels] = useState<ContentLabel[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// Load the available content types
	useEffect(() => {
		setIsLoading(true);
		dataService
			.query({
				query: GET_CONTENT_TYPES,
			})
			.then(response => {
				const types: string[] = get(response, 'data.lookup_enum_content_types', []).map(
					(type: { value: string }) => type.value
				);
				setContentTypes(types);
			})
			.catch(err => {
				console.error('Failed to get content types in ContentTypeAndLabelsPicker', err, {
					query: 'GET_CONTENT_TYPES',
				});
				toastService.danger(t('Het ophalen van de content pagina types is mislukt'));
			})
			.finally(() => setIsLoading(false));
	}, [setContentTypes, t]);

	useEffect(() => {
		setIsLoading(true);
		setLabels(
			[
				`${selectedContentType}-test1`,
				`${selectedContentType}-test2`,
				`${selectedContentType}-test3`,
			].map(
				(label, index): ContentLabel => ({
					label,
					id: index,
					content_type: selectedContentType,
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
	}, [selectedContentType, setLabels, t]);

	const renderGroupLabel = (data: any) => <span>{data.label}</span>;

	const renderSelectPicker = () => (
		<Grid>
			<Column size="1">
				<ReactSelect
					{...REACT_SELECT_DEFAULT_OPTIONS}
					id="content-type-and-label-picker-type"
					placeholder={t('admin/content/components/content-picker/content-picker___type')}
					options={contentTypes.map(
						(type: ContentTypeOption): SelectOption => ({ label: type, value: type })
					)}
					isSearchable={true}
					isMulti={false}
					onChange={(selectedItem: ValueType<PickerItem>) =>
						onSelectedContentTypeChanged(get(selectedItem, 'value') as ContentTypeOption)
					}
				/>
			</Column>
			<Column size="3">
				<ReactSelect
					{...REACT_SELECT_DEFAULT_OPTIONS}
					id="content-type-and-label-picker-label"
					placeholder={t('Labels')}
					options={labels.map(
						(label): SelectOption => ({ label: label.label, value: String(label.id) })
					)}
					isSearchable={true}
					isLoading={isLoading}
					onChange={(changedValue: ValueType<SelectOption>, actionMeta: ActionMeta) => {
						if (actionMeta.action === 'select-option') {
							onChange((changedValue as SelectOption).value);
						}
					}}
				/>
			</Column>
		</Grid>
	);

	const renderInputPicker = () => <TextInput value={input} onChange={onChangeText} />;

	const renderEditor = () => {
		switch (controls) {
			case 'content':
				return renderSelectPicker();
			case 'external-url':
				return renderInputPicker();
			default:
				return null;
		}
	};

	return (
		<>
			<RadioButtonGroup>
				<Flex orientation="horizontal" spaced="wide">
					<RadioButton
						label={t('admin/shared/components/content-picker/content-picker___content')}
						name="content"
						value="content"
						checked={controls === 'content'}
						onChange={() => setControls('content')}
					/>
					<RadioButton
						label={t('admin/shared/components/content-picker/content-picker___externe-url')}
						name="external-url"
						value="external-url"
						checked={controls === 'external-url'}
						onChange={() => setControls('external-url')}
					/>
				</Flex>
			</RadioButtonGroup>
			<FormGroup error={errors}>{renderEditor()}</FormGroup>
		</>
	);
};

export default ContentLabelPicker;
