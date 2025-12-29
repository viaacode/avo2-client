import { type DefaultProps, Form, FormGroup } from '@viaa/avo2-components';

import { clsx } from 'clsx';
import { type FC } from 'react';

import { formatTimestamp } from '../../shared/helpers/formatters/date';

import './AssignmentDetailsForm.scss';
import {
  AvoAssignmentAssignment,
  AvoAssignmentLabel,
  AvoAssignmentLabelType,
} from '@viaa/avo2-types';
import { tText } from '../../shared/helpers/translate-text';

interface AssignmentDetailsFormReadonlyProps {
  assignment: AvoAssignmentAssignment;
}

export const AssignmentDetailsFormReadonly: FC<
  AssignmentDetailsFormReadonlyProps & DefaultProps
> = ({ assignment, className, style }) => {
  return (
    <div className={clsx('c-assignment-details-form', className)} style={style}>
      <Form>
        <FormGroup label={tText('assignment/assignment___klas')}>
          <p>
            {(assignment.labels || [])
              .filter(
                (item: { assignment_label: AvoAssignmentLabel }) =>
                  item.assignment_label.type === AvoAssignmentLabelType.CLASS,
              )
              .map(
                (item: { assignment_label: AvoAssignmentLabel }) =>
                  item.assignment_label.label,
              )
              .join(', ') || '-'}
          </p>
        </FormGroup>

        <FormGroup label={tText('assignment/assignment___label')}>
          <p>
            {(assignment.labels || [])
              .filter(
                (item: { assignment_label: AvoAssignmentLabel }) =>
                  item.assignment_label.type === AvoAssignmentLabelType.LABEL,
              )
              .map(
                (item: { assignment_label: AvoAssignmentLabel }) =>
                  item.assignment_label.label,
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
            'assignment/assignment___optioneel',
          )})`}
        >
          <p>{assignment.answer_url || '-'}</p>
        </FormGroup>
      </Form>
    </div>
  );
};
