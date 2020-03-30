import { kebabCase } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Checkbox,
	Column,
	Container,
	DatePicker,
	Form,
	FormGroup,
	Grid,
	Select,
	SelectOption,
	TagInfo,
	TagsInput,
	TextInput,
	WYSIWYG,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DeleteObjectModal } from '../../../../shared/components';
import { CustomError } from '../../../../shared/helpers';
import { ToastService } from '../../../../shared/services';
import { ValueOf } from '../../../../shared/types';
import { UserGroupSelect } from '../../../shared/components';

import { DEFAULT_PAGES_WIDTH, GET_CONTENT_WIDTH_OPTIONS } from '../../content.const';
import { ContentService } from '../../content.service';
import {
	ContentEditFormErrors,
	ContentEditFormState,
	ContentPageType,
	ContentWidth,
} from '../../content.types';
import './ContentEditForm.scss';

interface ContentEditFormProps {
	contentTypes: SelectOption<ContentPageType>[];
	formErrors: ContentEditFormErrors;
	formState: ContentEditFormState;
	isAdminUser: boolean;
	onChange: (key: keyof ContentEditFormState, value: ValueOf<ContentEditFormState>) => void;
}

type DateFormKeys = 'publishAt' | 'depublishAt';

const ContentEditForm: FunctionComponent<ContentEditFormProps> = ({
	contentTypes = [],
	formErrors,
	formState,
	isAdminUser,
	onChange,
}) => {
	// Hooks
	const [t] = useTranslation();

	const [contentTypeLabels, setContentTypeLabels] = useState<Avo.Content.ContentLabel[]>([]);
	const [labelToBeCreated, setLabelToBeCreated] = useState<string | null>(null);
	const [isConfirmCreateModalOpen, setIsConfirmCreateModalOpen] = useState<boolean>(false);

	useEffect(() => {
		// Set fixed content width for specific page types
		Object.keys(DEFAULT_PAGES_WIDTH).forEach(key => {
			if (
				DEFAULT_PAGES_WIDTH[key as ContentWidth].includes(formState.contentType) &&
				formState.contentWidth !== key
			) {
				onChange('contentWidth', key);
			}
		});
	}, [formState.contentType, formState.contentWidth, onChange]);

	useEffect(() => {
		if (!formState.contentType) {
			return;
		}
		ContentService.fetchLabelsByContentType(formState.contentType)
			.then(setContentTypeLabels)
			.catch(err => {
				console.error('Failed to fetch content labels by content type', err, {
					contentType: formState.contentType,
				});
				ToastService.danger(
					t(
						'admin/content/components/content-edit-form/content-edit-form___het-ophalen-van-de-content-labels-is-mislukt'
					),
					false
				);
			});
	}, [formState.contentType, setContentTypeLabels, t]);

	// Computed
	const contentTypeOptions = [
		{ label: 'Kies een content type', value: '', disabled: true },
		...contentTypes.map(contentType => ({
			label: contentType.value,
			value: contentType.value,
		})),
	];

	// Methods
	const handleDateChange = (key: DateFormKeys, value: Date | null) => {
		onChange(key, value ? value.toISOString() : '');
	};

	const handleDateValue = (key: DateFormKeys) => {
		return formState[key] ? new Date(formState[key] as string) : null;
	};

	const handleContentTypeChange = (value: string) => {
		onChange('contentType', value);
		onChange('labels', []);
	};

	const handleLabelCreate = async (value: TagInfo) => {
		if (!value) {
			return;
		}
		setLabelToBeCreated(value.label);
		setIsConfirmCreateModalOpen(true);
	};

	const handleLabelCreateConfirmed = async () => {
		try {
			if (!labelToBeCreated) {
				throw new CustomError(
					'Failed to create label because the labelToBeCreated is undefined'
				);
			}
			const newLabel = await ContentService.insertContentLabel(
				labelToBeCreated,
				formState.contentType
			);
			onChange('labels', [...formState.labels, newLabel]);
		} catch (err) {
			console.error(new CustomError('Failed to create label', err, { labelToBeCreated }));
			ToastService.danger(
				t(
					'admin/content/components/content-edit-form/content-edit-form___het-aanmaken-van-het-label-is-mislukt'
				),
				false
			);
		}
	};

	const mapLabelsToTags = (contentLabels: Partial<Avo.Content.ContentLabel>[]): TagInfo[] => {
		return (contentLabels || []).map(contentLabel => ({
			label: contentLabel.label as string,
			value: String(contentLabel.id as number),
		}));
	};

	const mapTagsToLabels = (
		tags: TagInfo[],
		contentType: string
	): Partial<Avo.Content.ContentLabel>[] => {
		return (tags || []).map(tag => ({
			label: tag.label,
			id: tag.value as number,
			content_type: contentType,
		}));
	};

	// Render
	return (
		<Container mode="vertical" size="small">
			<Container mode="horizontal">
				<Container size="medium">
					<Form className="c-content-edit-form">
						<Grid>
							<Column size="12">
								<FormGroup
									error={formErrors.title}
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___titel'
									)}
								>
									<TextInput
										onChange={value => onChange('title', value)}
										value={formState.title}
									/>
								</FormGroup>
							</Column>
							<Column size="12">
								<FormGroup
									error={formErrors.description}
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___omschrijving'
									)}
								>
									<WYSIWYG
										onChange={(value: string) => onChange('description', value)}
										data={formState.description}
										id="description"
									/>
								</FormGroup>
							</Column>
							{isAdminUser && (
								<Column size="12">
									<FormGroup error={formErrors.isProtected}>
										<Checkbox
											checked={formState.isProtected}
											label={t(
												'admin/content/components/content-edit-form/content-edit-form___beschermde-pagina'
											)}
											onChange={value => onChange('isProtected', value)}
										/>
									</FormGroup>
								</Column>
							)}
							<Column size="12">
								<FormGroup
									error={formErrors.path}
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___url'
									)}
								>
									<TextInput
										onChange={value => onChange('path', value)}
										value={
											formState.path || `/${kebabCase(formState.title || '')}`
										}
									/>
								</FormGroup>
							</Column>
							<Column size="3-6">
								<FormGroup
									error={formErrors.contentType}
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___content-type'
									)}
								>
									<Select
										onChange={handleContentTypeChange}
										options={contentTypeOptions}
										value={formState.contentType}
									/>
								</FormGroup>
							</Column>
							<Column size="3-6">
								<FormGroup
									error={formErrors.contentWidth}
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___content-breedte'
									)}
								>
									<Select
										onChange={value => onChange('contentWidth', value)}
										options={GET_CONTENT_WIDTH_OPTIONS()}
										value={formState.contentWidth}
									/>
								</FormGroup>
							</Column>
							<Column size="12">
								<FormGroup
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___labels'
									)}
								>
									<TagsInput
										value={mapLabelsToTags(formState.labels)}
										options={mapLabelsToTags(contentTypeLabels)}
										placeholder={
											!!formState.contentType
												? t(
														'admin/content/components/content-edit-form/content-edit-form___kies-of-maak-een-label-optioneel'
												  )
												: t(
														'admin/content/components/content-edit-form/content-edit-form___kies-eerst-het-type-pagina'
												  )
										}
										allowMulti
										allowCreate
										onCreate={handleLabelCreate}
										onChange={values =>
											onChange(
												'labels',
												mapTagsToLabels(values, formState.contentType)
											)
										}
										disabled={!formState.contentType}
									/>
								</FormGroup>
							</Column>
							<Column size="12">
								<UserGroupSelect
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___zichtbaar-voor'
									)}
									error={formErrors.userGroupIds}
									placeholder={t(
										'admin/menu/components/menu-edit-form/menu-edit-form___niemand'
									)}
									values={formState.userGroupIds}
									required={false}
									onChange={(userGroupIds: number[]) =>
										onChange('userGroupIds', userGroupIds)
									}
								/>
							</Column>
							<Column size="3-6">
								<FormGroup
									error={formErrors.publishAt}
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___publiceren-op'
									)}
								>
									<DatePicker
										onChange={value => handleDateChange('publishAt', value)}
										showTimeInput
										value={handleDateValue('publishAt')}
									/>
								</FormGroup>
							</Column>
							<Column size="3-6">
								<FormGroup
									error={formErrors.depublishAt}
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___depubliceren-op'
									)}
								>
									<DatePicker
										onChange={value => handleDateChange('depublishAt', value)}
										showTimeInput
										value={handleDateValue('depublishAt')}
									/>
								</FormGroup>
							</Column>
						</Grid>
					</Form>
					<DeleteObjectModal
						title={t(
							'admin/content/components/content-edit-form/content-edit-form___maak-label-aan'
						)}
						body={t(
							'admin/content/components/content-edit-form/content-edit-form___weet-je-zeker-dat-je-een-nieuw-label-wil-aanmaken'
						)}
						confirmLabel={t(
							'admin/content/components/content-edit-form/content-edit-form___aanmaken'
						)}
						isOpen={isConfirmCreateModalOpen}
						onClose={() => setIsConfirmCreateModalOpen(false)}
						deleteObjectCallback={handleLabelCreateConfirmed}
					/>
				</Container>
			</Container>
		</Container>
	);
};

export default ContentEditForm;
