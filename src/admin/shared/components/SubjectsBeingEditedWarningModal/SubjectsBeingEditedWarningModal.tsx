import { type Avo } from '@viaa/avo2-types';
import { noop } from 'es-toolkit';
import React, { type FC, type ReactNode } from 'react';

import { type APP_PATH } from '../../../../constants.js';
import { ConfirmModal } from '../../../../shared/components/ConfirmModal/ConfirmModal.js';
import { buildLink } from '../../../../shared/helpers/build-link.js';
import { type ValueOf } from '../../../../shared/types/index.js';

import './SubjectsBeingEditedWarningModal.scss';
import { tText } from '../../../../shared/helpers/translate-text.js';

interface SubjectsBeingEditedWarningModalProps {
	isOpen: boolean;
	onClose?: () => void;
	title: ReactNode;
	editWarningSection1: ReactNode;
	editWarningSection2: ReactNode;
	route: ValueOf<typeof APP_PATH>['route'];
	confirmCallback: () => void;
	subjects: Avo.Share.EditStatus[];
}

export const SubjectsBeingEditedWarningModal: FC<SubjectsBeingEditedWarningModalProps> = ({
	onClose = noop,
	isOpen,
	title,
	editWarningSection1,
	editWarningSection2,
	route,
	confirmCallback,
	subjects,
}) => {
	const renderAssignmentBeingEditedMessage = () => {
		return (
			<>
				<p>{editWarningSection1}</p>
				<ul className="c-bulk-warning-being-edited">
					{subjects.map((subject) => (
						<li key={`assignment-being-edited-${subject.subjectId}`}>
							<a
								target="_blank"
								href={buildLink(route, {
									id: subject.subjectId,
								})}
								rel="noreferrer"
							>
								{subject.subjectTitle}
							</a>
						</li>
					))}
				</ul>
				<p>{editWarningSection2}</p>
			</>
		);
	};

	return (
		<ConfirmModal
			title={title}
			body={renderAssignmentBeingEditedMessage()}
			isOpen={isOpen}
			onClose={onClose}
			confirmCallback={confirmCallback}
			confirmButtonType="primary"
			confirmLabel={tText(
				'admin/shared/components/subjects-being-edited-warning-modal/subjects-being-edited-warning-modal___doorgaan'
			)}
		/>
	);
};
