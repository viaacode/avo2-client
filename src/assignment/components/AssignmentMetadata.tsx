import { Flex } from '@viaa/avo2-components';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { formatTimestamp } from '../../shared/helpers';
import { Assignment_Response_v2, Assignment_v2 } from '../assignment.types';

import './AssignmentMetadata.scss';

type AssignmentMetadataProps = {
	assignment: Assignment_v2;
	assignmentResponse?: Assignment_Response_v2 | null;
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
			<Flex className="l-assignment-response__meta-data">
				{[
					teacherName && (
						<>
							{t('assignment/views/assignment-response-edit___lesgever')}:
							<b>{` ${teacherName}`}</b>
						</>
					),
					pupilName && (
						<>
							{t('assignment/components/assignment-metadata___leerling')}:
							<b>{` ${pupilName}`}</b>
						</>
					),
					deadline && (
						<>
							{t('assignment/views/assignment-response-edit___deadline')}:
							<b>{` ${deadline}`}</b>
						</>
					),
					labels && (
						<>
							{t('assignment/views/assignment-response-edit___label')}:
							<b>{` ${labels}`}</b>
						</>
					),
					classes && (
						<>
							{t('assignment/views/assignment-response-edit___klas')}:
							<b>{` ${classes}`}</b>
						</>
					),
				]
					.filter((node) => !!node)
					.map((node, i) => (
						<div
							key={`l-assignment-response__meta-data__item--${i}`}
							className="l-assignment-response__meta-data__item"
						>
							{node}
						</div>
					))}
			</Flex>
		</section>
	);
};

export default AssignmentMetadata;
