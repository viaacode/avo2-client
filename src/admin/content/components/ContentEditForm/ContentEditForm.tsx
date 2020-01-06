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

import { ContentEditComponentState } from '../../content.types';

import './ContentEditForm.scss';

interface ContentTypeOptions {
	label: string;
	value: string;
	disabled?: boolean;
}

interface ContentEditFormProps {
	contentTypeOptions: ContentTypeOptions[];
	formErrors: Partial<ContentEditComponentState>;
	componentState: ContentEditComponentState;
	onChange: (
		key: keyof ContentEditComponentState,
		value: ValueOf<ContentEditComponentState>
	) => void;
}

type DateFormKeys = 'publishAt' | 'depublishAt';

const ContentEditForm: FunctionComponent<ContentEditFormProps> = ({
	contentTypeOptions = [],
	formErrors,
	componentState,
	onChange,
}) => {
	// Methods
	const handleDateChange = (key: DateFormKeys, value: Date | null) => {
		onChange(key, value ? value.toISOString() : '');
	};

	const handleDateValue = (key: DateFormKeys) => {
		return componentState[key] ? new Date(componentState[key] as string) : null;
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
										value={componentState.title}
									/>
								</FormGroup>
							</Column>
							<Column size="12">
								<FormGroup error={formErrors.description} label="Omschrijving">
									<TextArea
										onChange={(value: string) => onChange('description', value)}
										rows={3}
										value={componentState.description}
									/>
								</FormGroup>
							</Column>
							<Column size="3-12">
								<FormGroup error={formErrors.contentType} label="Content type">
									<Select
										onChange={(value: string) => onChange('contentType', value)}
										options={contentTypeOptions}
										value={componentState.contentType}
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
