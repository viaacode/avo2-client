import { type Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { type FC, type ReactNode } from 'react';

import { type APP_PATH } from '../../../../constants';
import ConfirmModal from '../../../../shared/components/ConfirmModal/ConfirmModal';
import { buildLink } from '../../../../shared/helpers';
import useTranslation from '../../../../shared/hooks/useTranslation';
import { type ValueOf } from '../../../../shared/types';

import './SubjectsBeingEditedWarningModal.scss';

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

const SubjectsBeingEditedWarningModal: FC<SubjectsBeingEditedWarningModalProps> = ({
	onClose = noop,
	isOpen,
	title,
	editWarningSection1,
	editWarningSection2,
	route,
	confirmCallback,
	subjects,
}) => {
	const { tText } = useTranslation();

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

export default SubjectsBeingEditedWarningModal;
