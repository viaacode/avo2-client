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
import classnames from 'classnames';
import { isPast } from 'date-fns';
import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { compose } from 'redux';

import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import {
	Assignment_v2_With_Blocks,
	Assignment_v2_With_Labels,
	AssignmentFormState,
} from '../assignment.types';
import { isDeadlineBeforeAvailableAt } from '../helpers/is-deadline-before-available-at';
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
	assignment: Assignment_v2_With_Labels & Assignment_v2_With_Blocks;
	setAssignment: Dispatch<SetStateAction<Assignment_v2_With_Labels & Assignment_v2_With_Blocks>>;
	setValue: UseFormSetValue<AssignmentFormState>;
}

const AssignmentDetailsFormEditable: FC<
	AssignmentDetailsFormEditableProps & UserProps & DefaultProps
> = ({ assignment, setAssignment, setValue, className, style, commonUser }) => {
	const { tText, tHtml } = useTranslation();

	const getId = useCallback(
		(key: string | number) => `${assignment.id}--${key}`,
		[assignment.id]
	);

	// Render

	if (!commonUser) {
		return (
			<Spacer margin="top-extra-large">
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			</Spacer>
		);
	}

	const deadline = assignment.deadline_at ? new Date(assignment.deadline_at) : null;
	const availableAt = assignment.available_at ? new Date(assignment.available_at) : new Date();
	return (
		<div className={classnames('c-assignment-details-form', className)} style={style}>
			<Form>
				<FormGroup
					label={tText('assignment/assignment___klas')}
					labelFor={getId(AssignmentDetailsFormIds.classrooms)}
					required
				>
					<AssignmentLabels
						type="CLASS"
						id={getId(AssignmentDetailsFormIds.classrooms)}
						labels={assignment.labels.filter(
							(item) => item.assignment_label.type === 'CLASS'
						)}
						commonUser={commonUser}
						dictionary={{
							placeholder: tText(
								'assignment/components/assignment-details-form-editable___voeg-een-klas-toe'
							),
							empty: tText(
								'assignment/components/assignment-details-form-editable___geen-klassen-beschikbaar'
							),
						}}
						onChange={(changed) => {
							let target = changed;

							if (changed.length > 1) {
								ToastService.danger(
									tHtml(
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
								blocks: (prev as Assignment_v2_With_Blocks)?.blocks || [],
							}));
						}}
					/>
				</FormGroup>

				<FormGroup
					label={`${tText('assignment/assignment___label')} (${tText(
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
						commonUser={commonUser}
						dictionary={{
							placeholder: tText(
								'assignment/components/assignment-details-form-editable___voeg-een-label-toe'
							),
							empty: tText(
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
								blocks: (prev as Assignment_v2_With_Blocks)?.blocks || [],
							}));
						}}
					/>
				</FormGroup>

				<FormGroup
					label={tText('assignment/assignment___beschikbaar-vanaf')}
					labelFor={getId(AssignmentDetailsFormIds.available_at)}
					required
				>
					<DatePicker
						value={availableAt}
						showTimeInput
						minDate={new Date()}
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
					label={tText('assignment/assignment___deadline')}
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
						{tText(
							'assignment/assignment___na-deze-datum-kan-de-leerling-de-opdracht-niet-meer-invullen'
						)}
					</p>
					{deadline && isPast(deadline) && (
						<p className="c-form-help-text--error">
							{tText(
								'assignment/components/assignment-details-form-editable___de-deadline-mag-niet-in-het-verleden-liggen'
							)}
						</p>
					)}
					{isDeadlineBeforeAvailableAt(availableAt, deadline) && (
						<p className="c-form-help-text--error">
							{tText(
								'assignment/components/assignment-details-form-editable___de-beschikbaar-vanaf-datum-moet-voor-de-deadline-liggen-anders-zullen-je-leerlingen-geen-toegang-hebben-tot-deze-opdracht'
							)}
						</p>
					)}
				</FormGroup>

				<FormGroup
					label={`${tText('assignment/assignment___link')} (${tText(
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
						{tText(
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
