import { Button } from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { Dispatch, FC, FunctionComponent, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AlertBar from '../../shared/components/AlertBar/AlertBar';
import { isMobileWidth } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import {
	Assignment_Response_v2,
	Assignment_v2_With_Blocks,
	AssignmentFormState,
} from '../assignment.types';
import AssignmentResponseEdit from '../views/AssignmentResponseEdit/AssignmentResponseEdit';

export type AssignmentPupilPreviewProps = {
	assignment: AssignmentFormState;
	isPreview?: boolean;
	onClose: () => void;
};

const AssignmentPupilPreview: FC<AssignmentPupilPreviewProps & UserProps> = ({
	assignment,
	isPreview = false,
	onClose,
	user,
}) => {
	const [t] = useTranslation();
	const [assignmentResponse, setAssignmentResponse] = useState<Assignment_Response_v2 | null>({
		collection_title: '',
		pupil_collection_blocks: [],
		assignment_id: assignment.id as string,
		assignment: assignment as unknown as Assignment_Response_v2['assignment'],
		owner: {
			full_name: t('assignment/components/assignment-pupil-preview___naam-leerling'),
		},
		owner_profile_id: user?.profile?.id,
		id: '///fake-assignment-response-id',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as Assignment_Response_v2);

	const renderClosePreviewButton = () => (
		<Button
			icon="close"
			label={
				isMobileWidth()
					? undefined
					: t('assignment/components/assignment-pupil-preview___sluit-preview')
			}
			ariaLabel={t('assignment/components/assignment-pupil-preview___sluit-preview')}
			type="borderless-i"
			onClick={onClose}
		/>
	);
	return (
		<>
			<AlertBar
				icon="info"
				textLeft={t(
					'assignment/components/assignment-pupil-preview___je-bent-aan-het-kijken-als-leerling'
				)}
				contentRight={renderClosePreviewButton()}
			/>
			{assignmentResponse && (
				<AssignmentResponseEdit
					assignment={assignment as Assignment_v2_With_Blocks}
					assignmentResponse={assignmentResponse}
					setAssignmentResponse={
						setAssignmentResponse as Dispatch<SetStateAction<Assignment_Response_v2>>
					}
					isPreview={isPreview}
					showBackButton={false}
					onAssignmentChanged={async () => {
						// Ignore changes to assignment during preview
					}}
					onShowPreviewClicked={noop}
				/>
			)}
		</>
	);
};

export default withUser(AssignmentPupilPreview) as FunctionComponent<AssignmentPupilPreviewProps>;
