import {
	DatePicker,
	DefaultProps,
	Flex,
	Form,
	FormGroup,
	Spacer,
	Spinner,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { isPast } from 'date-fns';
import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { compose } from 'redux';

import withUser, { UserProps } from '../../shared/hocs/withUser';
import { ToastService } from '../../shared/services';
import { AssignmentFormState } from '../assignment.types';
import { mergeWithOtherLabels } from '../helpers/merge-with-other-labels';

import AssignmentLabels from './AssignmentLabels';

import './AssignmentDetailsForm.scss';

export const AssignmentDetailsFormIds = {
	classrooms: 'c-assignment-details-form__classrooms', // labels with type 'CLASS'
	labels: 'c-assignment-details-form__labels', // labels with type 'LABEL'
	available_at: 'c-assignment-details-form__available_at',
	deadline_at: 'c-assignment-details-form__deadline_at',
	answer_url: 'c-assignment-details-form__answer_url',
};

export interface AssignmentDetailsFormEditableProps {
	assignment: Avo.Assignment.Assignment_v2;
	setAssignment: Dispatch<SetStateAction<Avo.Assignment.Assignment_v2>>;
	setValue: UseFormSetValue<AssignmentFormState>;
}

const AssignmentDetailsFormEditable: FC<
	AssignmentDetailsFormEditableProps & UserProps & DefaultProps
> = ({ assignment, setAssignment, setValue, className, style, user }) => {
	const [t] = useTranslation();

	const getId = useCallback(
		(key: string | number) => `${assignment.id}--${key}`,
		[assignment.id]
	);

	// Render

	if (!user) {
		return (
			<Spacer margin="top-extra-large">
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			</Spacer>
		);
	}

	const deadline = assignment.deadline_at ? new Date(assignment.deadline_at) : null;
	return (
		<div className={classnames('c-assignment-details-form', className)} style={style}>
			<Form>
				<FormGroup
					label={t('assignment/assignment___klas')}
					labelFor={getId(AssignmentDetailsFormIds.classrooms)}
					required
				>
					<AssignmentLabels
						type="CLASS"
						id={getId(AssignmentDetailsFormIds.classrooms)}
						labels={assignment.labels.filter(
							(item) => item.assignment_label.type === 'CLASS'
						)}
						user={user}
						dictionary={{
							placeholder: t(
								'assignment/components/assignment-details-form-editable___voeg-een-klas-toe'
							),
							empty: t(
								'assignment/components/assignment-details-form-editable___geen-klassen-beschikbaar'
							),
						}}
						onChange={(changed) => {
							let target = changed;

							if (changed.length > 1) {
								ToastService.danger(
									t(
										'assignment/components/assignment-details-form-editable___opgepast-je-kan-maar-1-klas-instellen-per-opdracht'
									)
								);
								target = [changed[0]];
							}

							const newLabels = mergeWithOtherLabels(
								assignment.labels,
								target,
								'CLASS'
							);

							setValue('labels', newLabels, {
								shouldDirty: true,
								shouldTouch: true,
							});

							setAssignment((prev) => ({
								...prev,
								labels: newLabels,
							}));
						}}
					/>
				</FormGroup>

				<FormGroup
					label={`${t('assignment/assignment___label')} (${t(
						'assignment/assignment___optioneel'
					)})`}
					labelFor={getId(AssignmentDetailsFormIds.labels)}
				>
					<AssignmentLabels
						type="LABEL"
						id={getId(AssignmentDetailsFormIds.labels)}
						labels={assignment.labels.filter(
							(item) => item.assignment_label.type === 'LABEL'
						)}
						user={user}
						dictionary={{
							placeholder: t(
								'assignment/components/assignment-details-form-editable___voeg-een-label-toe'
							),
							empty: t(
								'assignment/components/assignment-details-form-editable___geen-labels-beschikbaar'
							),
						}}
						onChange={(changed) => {
							setValue('labels', changed, {
								shouldDirty: true,
								shouldTouch: true,
							});
							setAssignment((prev) => ({
								...prev,
								labels: mergeWithOtherLabels(prev.labels, changed, 'LABEL'),
							}));
						}}
					/>
				</FormGroup>

				<FormGroup
					label={t('assignment/assignment___beschikbaar-vanaf')}
					labelFor={getId(AssignmentDetailsFormIds.available_at)}
					required
				>
					<DatePicker
						value={
							assignment.available_at ? new Date(assignment.available_at) : new Date()
						}
						showTimeInput
						onChange={(value: Date | null) => {
							setValue('available_at', value?.toISOString(), {
								shouldDirty: true,
								shouldTouch: true,
							});
							setAssignment((prev) => ({
								...prev,
								available_at: value ? value.toISOString() : null,
							}));
						}}
					/>
				</FormGroup>

				<FormGroup
					label={t('assignment/assignment___deadline')}
					labelFor={getId(AssignmentDetailsFormIds.deadline_at)}
					required
				>
					<DatePicker
						value={deadline}
						showTimeInput
						minDate={new Date()}
						onChange={(value) => {
							setValue('deadline_at', value?.toISOString(), {
								shouldDirty: true,
								shouldTouch: true,
							});
							setAssignment((prev) => ({
								...prev,
								deadline_at: value ? value.toISOString() : null,
							}));
						}}
						defaultTime="23:59"
					/>
					<p className="c-form-help-text">
						{t(
							'assignment/assignment___na-deze-datum-kan-de-leerling-de-opdracht-niet-meer-invullen'
						)}
					</p>
					{deadline && isPast(deadline) && (
						<p className="c-form-help-text--error">
							{t(
								'assignment/components/assignment-details-form-editable___de-deadline-mag-niet-in-het-verleden-liggen'
							)}
						</p>
					)}
				</FormGroup>

				<FormGroup
					label={`${t('assignment/assignment___link')} (${t(
						'assignment/assignment___optioneel'
					)})`}
					labelFor={getId(AssignmentDetailsFormIds.answer_url)}
				>
					<TextInput
						id={getId(AssignmentDetailsFormIds.answer_url)}
						onChange={(answerUrl) => {
							setValue('answer_url', answerUrl, {
								shouldDirty: true,
								shouldTouch: true,
							});
							setAssignment({ ...assignment, answer_url: answerUrl });
						}}
						value={assignment.answer_url || undefined}
					/>
					<p className="c-form-help-text">
						{t(
							'assignment/assignment___wil-je-je-leerling-een-taak-laten-maken-voeg-dan-hier-een-hyperlink-toe-naar-een-eigen-antwoordformulier-of-invuloefening'
						)}
					</p>
				</FormGroup>
			</Form>
		</div>
	);
};

export default compose(withUser)(
	AssignmentDetailsFormEditable
) as FC<AssignmentDetailsFormEditableProps>;
