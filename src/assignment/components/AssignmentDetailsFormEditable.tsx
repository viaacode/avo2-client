import {
	Alert,
	Column,
	Container,
	DatePicker,
	type DefaultProps,
	Flex,
	Form,
	FormGroup,
	Grid,
	Spacer,
	Spinner,
	TextInput,
} from '@viaa/avo2-components';
import { clsx } from 'clsx';
import { isAfter, isPast } from 'date-fns';
import React, { type FC, useCallback } from 'react';
import { compose } from 'redux';

import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import { endOfAcademicYear } from '../helpers/academic-year';
import { isDeadlineBeforeAvailableAt } from '../helpers/is-deadline-before-available-at';
import { mergeWithOtherLabels } from '../helpers/merge-with-other-labels';
import { type AssignmentFields } from '../hooks/assignment-form';

import AssignmentLabels from './AssignmentLabels';

import './AssignmentDetailsForm.scss';

const AssignmentDetailsFormIds = {
	classrooms: 'c-assignment-details-form__classrooms', // labels with type 'CLASS'
	labels: 'c-assignment-details-form__labels', // labels with type 'LABEL'
	available_at: 'c-assignment-details-form__available_at',
	deadline_at: 'c-assignment-details-form__deadline_at',
	answer_url: 'c-assignment-details-form__answer_url',
};

interface AssignmentDetailsFormEditableProps {
	assignment: Partial<AssignmentFields>;
	setAssignment: (newAssignmentFields: Partial<AssignmentFields>) => void;
	onFocus?: () => void;
}

const AssignmentDetailsFormEditable: FC<
	AssignmentDetailsFormEditableProps & UserProps & DefaultProps
> = ({ assignment, setAssignment, className, style, commonUser, onFocus }) => {
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
		<div className={clsx('c-assignment-details-form', className)} style={style}>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7" className="u-spacer-bottom">
									<FormGroup
										label={tText('assignment/assignment___klas')}
										labelFor={getId(AssignmentDetailsFormIds.classrooms)}
									>
										<AssignmentLabels
											type="CLASS"
											id={getId(AssignmentDetailsFormIds.classrooms)}
											labels={(assignment.labels || []).filter(
												(item) => item.assignment_label.type === 'CLASS'
											)}
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
													assignment.labels || [],
													target,
													'CLASS'
												);

												setAssignment({
													...assignment,
													labels: newLabels,
												});
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
											labels={(assignment.labels || []).filter(
												(item) => item.assignment_label.type === 'LABEL'
											)}
											dictionary={{
												placeholder: tText(
													'assignment/components/assignment-details-form-editable___voeg-een-label-toe'
												),
												empty: tText(
													'assignment/components/assignment-details-form-editable___geen-labels-beschikbaar'
												),
											}}
											onChange={(changed) => {
												setAssignment({
													...assignment,
													labels: mergeWithOtherLabels(
														assignment.labels || [],
														changed,
														'LABEL'
													),
												});
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
											maxDate={endOfAcademicYear()}
											onChange={(value: Date | null) => {
												setAssignment({
													...assignment,
													available_at: value
														? value.toISOString()
														: null,
												});
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
											maxDate={endOfAcademicYear()}
											onChange={(value) => {
												setAssignment({
													...assignment,
													deadline_at: value ? value.toISOString() : null,
												});
											}}
											defaultTime="23:59"
										/>
										<p className="c-form-help-text">
											{tHtml(
												'assignment/assignment___na-deze-datum-kan-de-leerling-de-opdracht-niet-meer-invullen'
											)}
										</p>
										{deadline && isPast(deadline) && (
											<p className="c-form-help-text--error">
												{tHtml(
													'assignment/components/assignment-details-form-editable___de-deadline-mag-niet-in-het-verleden-liggen'
												)}
											</p>
										)}
										{isDeadlineBeforeAvailableAt(availableAt, deadline) && (
											<p className="c-form-help-text--error">
												{tHtml(
													'assignment/components/assignment-details-form-editable___de-beschikbaar-vanaf-datum-moet-voor-de-deadline-liggen-anders-zullen-je-leerlingen-geen-toegang-hebben-tot-deze-opdracht'
												)}
											</p>
										)}
										{deadline && isAfter(deadline, endOfAcademicYear()) && (
											<p className="c-form-help-text--error">
												{tHtml(
													'assignment/components/assignment-details-form-editable___de-deadline-moet-voor-31-augustus-liggen'
												)}
											</p>
										)}
									</FormGroup>

									<FormGroup
										label={`${tHtml('assignment/assignment___link')} (${tHtml(
											'assignment/assignment___optioneel'
										)})`}
										labelFor={getId(AssignmentDetailsFormIds.answer_url)}
									>
										<TextInput
											id={getId(AssignmentDetailsFormIds.answer_url)}
											onChange={(answerUrl) => {
												setAssignment({
													...assignment,
													answer_url: answerUrl,
												} as AssignmentFields);
											}}
											value={assignment.answer_url || undefined}
											onFocus={onFocus}
										/>
										<p className="c-form-help-text">
											{tText(
												'assignment/assignment___wil-je-je-leerling-een-taak-laten-maken-voeg-dan-hier-een-hyperlink-toe-naar-een-eigen-antwoordformulier-of-invuloefening'
											)}
										</p>
									</FormGroup>
								</Column>

								<Column size="3-5">
									<Alert className="u-spacer-bottom">
										{tHtml(
											'assignment/components/assignment-details-form-editable___hier-stel-je-als-leerkracht-de-onderverdeling-van-je-opdracht-in-en-gegevens-die-leerlingen-te-zien-krijgen-bij-de-opdracht'
										)}
									</Alert>
								</Column>
							</Grid>
						</Spacer>
					</Form>
				</Container>
			</Container>
		</div>
	);
};

export default compose(withUser)(
	AssignmentDetailsFormEditable
) as FC<AssignmentDetailsFormEditableProps>;
