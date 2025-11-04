import { type DefaultProps, Form, FormGroup } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import React, { type FC } from 'react';

import { formatTimestamp } from '../../shared/helpers/formatters/date';
import { useTranslation } from '../../shared/hooks/useTranslation';

import './AssignmentDetailsForm.scss';

interface AssignmentDetailsFormReadonlyProps {
	assignment: Avo.Assignment.Assignment;
}

export const AssignmentDetailsFormReadonly: FC<
	AssignmentDetailsFormReadonlyProps & DefaultProps
> = ({ assignment, className, style }) => {
	const { tText } = useTranslation();

	return (
		<div className={clsx('c-assignment-details-form', className)} style={style}>
			<Form>
				<FormGroup label={tText('assignment/assignment___klas')}>
					<p>
						{(assignment.labels || [])
							.filter(
								(item: { assignment_label: Avo.Assignment.Label }) =>
									item.assignment_label.type === 'CLASS'
							)
							.map(
								(item: { assignment_label: Avo.Assignment.Label }) =>
									item.assignment_label.label
							)
							.join(', ') || '-'}
					</p>
				</FormGroup>

				<FormGroup label={tText('assignment/assignment___label')}>
					<p>
						{(assignment.labels || [])
							.filter(
								(item: { assignment_label: Avo.Assignment.Label }) =>
									item.assignment_label.type === 'LABEL'
							)
							.map(
								(item: { assignment_label: Avo.Assignment.Label }) =>
									item.assignment_label.label
							)
							.join(', ') || '-'}
					</p>
				</FormGroup>

				<FormGroup label={tText('assignment/assignment___beschikbaar-vanaf')}>
					<p>{formatTimestamp(assignment.available_at) || '-'}</p>
				</FormGroup>

				<FormGroup label={tText('assignment/assignment___deadline')}>
					<p>{formatTimestamp(assignment.deadline_at) || '-'}</p>
				</FormGroup>

				<FormGroup
					label={`${tText('assignment/assignment___link')} (${tText(
						'assignment/assignment___optioneel'
					)})`}
				>
					<p>{assignment.answer_url || '-'}</p>
				</FormGroup>
			</Form>
		</div>
	);
};
