import { DefaultProps, Form, FormGroup } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { formatTimestamp } from '../../shared/helpers';

import './AssignmentDetailsForm.scss';

export interface AssignmentDetailsFormReadonlyProps {
	assignment: Avo.Assignment.Assignment_v2;
}

const AssignmentDetailsFormReadonly: FC<AssignmentDetailsFormReadonlyProps & DefaultProps> = ({
	assignment,
	className,
	style,
}) => {
	const [t] = useTranslation();

	return (
		<div className={classnames('c-assignment-details-form', className)} style={style}>
			<Form>
				<FormGroup label={t('assignment/assignment___klas')}>
					<p>
						{assignment.labels
							.filter((item) => item.assignment_label.type === 'CLASS')
							.map((item) => item.assignment_label.label)
							.join(', ') || '-'}
					</p>
				</FormGroup>

				<FormGroup label={t('assignment/assignment___label')}>
					<p>
						{assignment.labels
							.filter((item) => item.assignment_label.type === 'LABEL')
							.map((item) => item.assignment_label.label)
							.join(', ') || '-'}
					</p>
				</FormGroup>

				<FormGroup label={t('assignment/assignment___beschikbaar-vanaf')}>
					<p>{formatTimestamp(assignment.available_at) || '-'}</p>
				</FormGroup>

				<FormGroup label={t('assignment/assignment___deadline')}>
					<p>{formatTimestamp(assignment.deadline_at) || '-'}</p>
				</FormGroup>

				<FormGroup
					label={`${t('assignment/assignment___link')} (${t(
						'assignment/assignment___optioneel'
					)})`}
				>
					<p>{assignment.answer_url || '-'}</p>
				</FormGroup>
			</Form>
		</div>
	);
};

export default AssignmentDetailsFormReadonly;
