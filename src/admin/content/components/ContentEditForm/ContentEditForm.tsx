import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Column,
	Container,
	DatePicker,
	Form,
	FormGroup,
	Grid,
	Select,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';

import { ValueOf } from '../../../../shared/types';
import UserGroupSelect from '../../../shared/components/UserGroupSelect/UserGroupSelect';

import { ContentEditFormState } from '../../content.types';
import './ContentEditForm.scss';

interface ContentTypeOptions {
	label: string;
	value: string;
	disabled?: boolean;
}

interface ContentEditFormProps {
	contentTypeOptions: ContentTypeOptions[];
	formErrors: Partial<ContentEditFormState>;
	formState: ContentEditFormState;
	onChange: (key: keyof ContentEditFormState, value: ValueOf<ContentEditFormState>) => void;
}

type DateFormKeys = 'publishAt' | 'depublishAt';

const ContentEditForm: FunctionComponent<ContentEditFormProps> = ({
	contentTypeOptions = [],
	formErrors,
	formState,
	onChange,
}) => {
	const [t] = useTranslation();

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
									<TextInput
										onChange={(value: string) => onChange('title', value)}
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
									<TextArea
										onChange={(value: string) => onChange('description', value)}
										rows={3}
										value={formState.description}
									/>
								</FormGroup>
							</Column>
							<Column size="12">
								<FormGroup error={formErrors.path} label={t('Url')}>
									<TextInput
										onChange={(value: string) => onChange('path', value)}
										value={formState.path}
									/>
								</FormGroup>
							</Column>
							<Column size="3-12">
								<FormGroup
									error={formErrors.contentType}
									label={t(
										'admin/content/components/content-edit-form/content-edit-form___content-type'
									)}
								>
									<Select
										onChange={(value: string) => onChange('contentType', value)}
										options={contentTypeOptions}
										value={formState.contentType}
									/>
								</FormGroup>
							</Column>
							<Column size="12">
								<UserGroupSelect
									label={t('Zichtbaar voor')}
									error={'' /* formErrors.group_access */}
									placeholder={t('admin/menu/components/menu-edit-form/menu-edit-form___niemand')}
									values={[1]}
									required={false}
									onChange={
										() => {} /* (userGroupIds: number[]) => onChange('group_access', userGroupIds) */
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
										onChange={(value: Date | null) => handleDateChange('publishAt', value)}
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
										onChange={(value: Date | null) => handleDateChange('depublishAt', value)}
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
