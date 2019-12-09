import React, { FunctionComponent } from 'react';

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

import { ContentEditFormState } from '../../content.types';

import './ContentEditForm.scss';

interface ContentEditFormProps {
	contentTypeOptions: {
		label: string;
		value: string;
		disabled?: boolean;
	}[];
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
								<FormGroup error={formErrors.title} label="Titel">
									<TextInput
										onChange={(value: string) => onChange('title', value)}
										value={formState.title}
									/>
								</FormGroup>
							</Column>
							<Column size="12">
								<FormGroup error={formErrors.description} label="Omschrijving">
									<TextArea
										onChange={(value: string) => onChange('description', value)}
										rows={3}
										value={formState.description}
									/>
								</FormGroup>
							</Column>
							<Column size="3-12">
								<FormGroup error={formErrors.contentType} label="Content type">
									<Select
										onChange={(value: string) => onChange('contentType', value)}
										options={contentTypeOptions}
										value={formState.contentType}
									/>
								</FormGroup>
							</Column>
							<Column size="3-6">
								<FormGroup error={formErrors.publishAt} label="Publiceren op">
									<DatePicker
										onChange={(value: Date | null) => handleDateChange('publishAt', value)}
										showTimeInput
										value={handleDateValue('publishAt')}
									/>
								</FormGroup>
							</Column>
							<Column size="3-6">
								<FormGroup error={formErrors.depublishAt} label="Depubliceren op">
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
