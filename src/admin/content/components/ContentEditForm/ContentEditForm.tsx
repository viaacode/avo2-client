import React, { FunctionComponent, useEffect } from 'react';
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
	TextArea,
	TextInput,
} from '@viaa/avo2-components';

import { ValueOf } from '../../../../shared/types';
import { UserGroupSelect } from '../../../shared/components';

import { CONTENT_WIDTH_OPTIONS, DEFAULT_PAGES_WIDTH } from '../../content.const';
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
									label={t('admin/content/components/content-edit-form/content-edit-form___titel')}
								>
									<TextInput onChange={value => onChange('title', value)} value={formState.title} />
								</FormGroup>
							</Column>
							<Column size="12">
								<FormGroup
									error={formErrors.description}
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___omschrijving'
									)}
								>
									<TextArea
										onChange={(value: string) => onChange('description', value)}
										rows={3}
										value={formState.description}
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
									label={t('admin/content/components/content-edit-form/content-edit-form___url')}
								>
									<TextInput
										onChange={value => onChange('path', value)}
										value={formState.path || ''}
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
										onChange={value => onChange('contentType', value)}
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
										options={CONTENT_WIDTH_OPTIONS}
										value={formState.contentWidth}
									/>
								</FormGroup>
							</Column>
							<Column size="12">
								<UserGroupSelect
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___zichtbaar-voor'
									)}
									error={formErrors.userGroupIds}
									placeholder={t('admin/menu/components/menu-edit-form/menu-edit-form___niemand')}
									values={formState.userGroupIds}
									required={false}
									onChange={(userGroupIds: number[]) => onChange('userGroupIds', userGroupIds)}
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
				</Container>
			</Container>
		</Container>
	);
};

export default ContentEditForm;
