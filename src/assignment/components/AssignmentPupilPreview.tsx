import { Button } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { FC, FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AlertBar from '../../shared/components/AlertBar/AlertBar';
import { isMobileWidth } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { AssignmentFormState } from '../assignment.types';
import AssignmentResponseEdit from '../views/AssignmentResponseEdit/AssignmentResponseEdit';

export type AssignmentPupilPreviewProps = {
	assignment: AssignmentFormState;
	onClose: () => void;
};

const AssignmentPupilPreview: FC<AssignmentPupilPreviewProps & UserProps> = ({
	assignment,
	onClose,
	user,
}) => {
	const [t] = useTranslation();
	const [assignmentResponse, setAssignmentResponse] = useState<Avo.Assignment.Response_v2 | null>(
		{
			collection_title: '',
			pupil_collection_blocks: [],
			assignment_id: assignment.id as string,
			assignment,
			owner: {
				full_name: t('naam leerling'),
			},
			owner_profile_id: user?.profile?.id,
			id: '///fake-assignment-response-id',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		} as Avo.Assignment.Response_v2
	);

	const renderClosePreviewButton = () => (
		<Button
			icon="close"
			label={isMobileWidth() ? undefined : t('Sluit preview')}
			ariaLabel={t('Sluit preview')}
			type="borderless-i"
			onClick={onClose}
		/>
	);
	return (
		<>
			<AlertBar
				icon="info"
				textLeft={t('Je bent aan het kijken als leerling.')}
				contentRight={renderClosePreviewButton()}
			/>
			<AssignmentResponseEdit
				assignment={assignment as Avo.Assignment.Assignment_v2}
				assignmentResponse={assignmentResponse}
				setAssignmentResponse={setAssignmentResponse}
				onAssignmentChanged={async () => {
					// Ignore changes to assignment during preview
				}}
				onShowPreviewClicked={noop}
			/>
		</>
	);
};

export default withUser(AssignmentPupilPreview) as FunctionComponent<AssignmentPupilPreviewProps>;
