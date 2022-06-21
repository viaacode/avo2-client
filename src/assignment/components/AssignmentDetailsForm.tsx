import React, { FC, useCallback, useMemo } from 'react';
import { compose } from 'redux';

import {
	DatePicker,
	DatePickerProps,
	DefaultProps,
	Form,
	FormGroup,
	TextInput,
	TextInputProps,
} from '@viaa/avo2-components';
import { AssignmentLabel_v2 } from '@viaa/avo2-types/types/assignment';

import withUser, { UserProps } from '../../shared/hocs/withUser';
import { LabeledFormField } from '../../shared/types';
import { AssignmentFormState, AssignmentLabelType } from '../assignment.types';
import { useAssignmentForm } from '../hooks';

import './AssignmentDetailsForm.scss';
import AssignmentLabels, { AssignmentLabelsProps } from './AssignmentLabels';

export type AssignmentDetailsFormAnswerUrlField = LabeledFormField & TextInputProps;
export type AssignmentDetailsFormLabelsField = LabeledFormField & Partial<AssignmentLabelsProps>;
export type AssignmentDetailsFormDatepickerField = LabeledFormField & Partial<DatePickerProps>;

export interface AssignmentDetailsFormProps extends DefaultProps {
	id?: string | number;
	initial?: AssignmentFormState;
	state?: [AssignmentFormState, React.Dispatch<React.SetStateAction<AssignmentFormState>>];
	classrooms?: AssignmentDetailsFormLabelsField;
	labels?: AssignmentDetailsFormLabelsField;
	available_at?: AssignmentDetailsFormDatepickerField;
	deadline_at?: AssignmentDetailsFormDatepickerField;
	answer_url?: AssignmentDetailsFormAnswerUrlField;
}

export const AssignmentDetailsFormIds = {
	classrooms: 'c-assignment-details-form__classrooms', // labels with type 'CLASS'
	labels: 'c-assignment-details-form__labels', // labels with type 'LABEL'
	available_at: 'c-assignment-details-form__available_at',
	deadline_at: 'c-assignment-details-form__deadline_at',
	answer_url: 'c-assignment-details-form__answer_url',
};

const AssignmentDetailsForm: FC<AssignmentDetailsFormProps & UserProps> = (props) => {
	const { id, initial, state, style, className, user } = props;

	// Data
	const [assignment, setAssignment] = useAssignmentForm(initial, state);

	const wrapperClasses = useMemo(
		() => ['c-assignment-details-form', ...(!!className ? [className] : [])],
		[className]
	);

	const getId = useCallback((key: string | number) => `${id}--${key}`, [id]);

	return (
		<div className={wrapperClasses.join(' ')} style={style}>
			<Form>
				{user && props.classrooms && (
					<FormGroup
						label={props.classrooms.label}
						labelFor={getId(AssignmentDetailsFormIds.classrooms)}
						required
					>
						<AssignmentLabels
							{...props.classrooms}
							id={getId(AssignmentDetailsFormIds.classrooms)}
							labels={
								assignment.labels.filter(
									(label) => label.type === AssignmentLabelType.CLASS
								) as AssignmentLabel_v2[]
							} // TODO: remove cast
							user={user}
							onChange={(added) =>
								setAssignment((prev) => ({
									...assignment,
									labels: [
										...prev.labels,
										...added.map((item) => ({
											...item,
											type: AssignmentLabelType.CLASS,
										})),
									],
								}))
							}
						/>

						{props.classrooms.help && (
							<p className="c-form-help-text">{props.classrooms.help}</p>
						)}
					</FormGroup>
				)}

				{user && props.labels && (
					<FormGroup
						label={props.labels.label}
						labelFor={getId(AssignmentDetailsFormIds.labels)}
						required
					>
						<AssignmentLabels
							{...props.labels}
							id={getId(AssignmentDetailsFormIds.labels)}
							labels={
								assignment.labels.filter(
									(label) => label.type === AssignmentLabelType.LABEL
								) as AssignmentLabel_v2[]
							} // TODO: remove cast
							user={user}
							onChange={(added) =>
								setAssignment((prev) => ({
									...assignment,
									labels: [
										...prev.labels,
										...added.map((item) => ({
											...item,
											type: AssignmentLabelType.LABEL,
										})),
									],
								}))
							}
						/>

						{props.labels.help && (
							<p className="c-form-help-text">{props.labels.help}</p>
						)}
					</FormGroup>
				)}

				{props.available_at && (
					<FormGroup
						label={props.available_at.label}
						labelFor={getId(AssignmentDetailsFormIds.available_at)}
						required
					>
						<DatePicker
							value={
								assignment.available_at
									? new Date(assignment.available_at)
									: new Date()
							}
							onChange={(value: Date | null) =>
								setAssignment((prev) => ({
									...prev,
									available_at: value ? value.toISOString() : null,
								}))
							}
							showTimeInput
						/>

						{props.available_at.help && (
							<p className="c-form-help-text">{props.available_at.help}</p>
						)}
					</FormGroup>
				)}

				{props.deadline_at && (
					<FormGroup
						label={props.deadline_at.label}
						labelFor={getId(AssignmentDetailsFormIds.deadline_at)}
						required
					>
						<DatePicker
							value={assignment.deadline_at ? new Date(assignment.deadline_at) : null}
							onChange={(value) =>
								setAssignment((prev) => ({
									...prev,
									deadline_at: value ? value.toISOString() : null,
								}))
							}
							showTimeInput
						/>

						{props.deadline_at.help && (
							<p className="c-form-help-text">{props.deadline_at.help}</p>
						)}
					</FormGroup>
				)}

				{props.answer_url && (
					<FormGroup
						label={props.answer_url.label}
						labelFor={getId(AssignmentDetailsFormIds.answer_url)}
					>
						<TextInput
							{...props.answer_url}
							id={getId(AssignmentDetailsFormIds.answer_url)}
							onChange={(answerUrl) =>
								setAssignment({ ...assignment, answer_url: answerUrl })
							}
							value={assignment.answer_url || undefined}
						/>

						{props.answer_url.help && (
							<p className="c-form-help-text">{props.answer_url.help}</p>
						)}
					</FormGroup>
				)}
			</Form>
		</div>
	);
};

export default compose(withUser)(AssignmentDetailsForm) as FC<AssignmentDetailsFormProps>;
