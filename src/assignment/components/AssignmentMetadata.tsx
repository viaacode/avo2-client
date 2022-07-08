import { Flex, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { formatTimestamp } from '../../shared/helpers';

type AssignmentMetadataProps = {
	assignment: Avo.Assignment.Assignment_v2;
	assignmentResponse?: Avo.Assignment.Response_v2 | null;
	who: 'teacher' | 'pupil';
};

const AssignmentMetadata: FC<AssignmentMetadataProps> = ({
	assignment,
	assignmentResponse,
	who,
}) => {
	const [t] = useTranslation();

	if (!assignment) {
		return null;
	}
	const teacherName = who === 'teacher' && assignment?.owner?.full_name;
	const pupilName = who === 'pupil' && assignmentResponse?.owner?.full_name;
	const deadline = formatTimestamp(assignment?.deadline_at, false);
	const labels = (assignment?.labels || [])
		.filter((label) => label.assignment_label.type === 'LABEL')
		.map((label) => label.assignment_label.label)
		.join(', ');
	const classes = (assignment?.labels || [])
		.filter((label) => label.assignment_label.type === 'CLASS')
		.map((label) => label.assignment_label.label)
		.join(', ');

	return (
		<section className="u-spacer-bottom">
			<Flex className="l-assignment-response--meta-data">
				{teacherName && (
					<Spacer margin="right">
						{t('assignment/views/assignment-response-edit___lesgever')}:{' '}
						<b>{teacherName}</b>
					</Spacer>
				)}

				{pupilName && (
					<Spacer margin="right">
						{t('Leerling')}: <b>{pupilName}</b>
					</Spacer>
				)}

				{deadline && (
					<Spacer margin="right">
						{t('assignment/views/assignment-response-edit___deadline')}:{' '}
						<b>{deadline}</b>
					</Spacer>
				)}

				{labels && (
					<Spacer margin="right">
						{t('assignment/views/assignment-response-edit___label')}: <b>{labels}</b>
					</Spacer>
				)}

				{classes && (
					<Spacer margin="right">
						{t('assignment/views/assignment-response-edit___klas')}: <b>{classes}</b>
					</Spacer>
				)}
			</Flex>
		</section>
	);
};

export default AssignmentMetadata;
