import { Flex } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { FC } from 'react';

import { formatTimestamp } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';

import './AssignmentMetadata.scss';

type AssignmentMetadataProps = {
	assignment: Avo.Assignment.Assignment;
	assignmentResponse?: Omit<Avo.Assignment.Response, 'assignment'> | null;
	who: 'teacher' | 'pupil';
};

const AssignmentMetadata: FC<AssignmentMetadataProps> = ({
	assignment,
	assignmentResponse,
	who,
}) => {
	const { tHtml } = useTranslation();

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
							{tHtml('assignment/views/assignment-response-edit___lesgever')}:
							<b>{` ${teacherName}`}</b>
						</>
					),
					pupilName && (
						<>
							{tHtml('assignment/components/assignment-metadata___leerling')}:
							<b>{` ${pupilName}`}</b>
						</>
					),
					deadline && (
						<>
							{tHtml('assignment/views/assignment-response-edit___deadline')}:
							<b>{` ${deadline}`}</b>
						</>
					),
					labels && (
						<>
							{tHtml('assignment/views/assignment-response-edit___label')}:
							<b>{` ${labels}`}</b>
						</>
					),
					classes && (
						<>
							{tHtml('assignment/views/assignment-response-edit___klas')}:
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
