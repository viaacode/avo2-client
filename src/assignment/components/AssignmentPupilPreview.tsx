import { Button } from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { Dispatch, FC, FunctionComponent, SetStateAction, useState } from 'react';

import AlertBar from '../../shared/components/AlertBar/AlertBar';
import { isMobileWidth } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	Assignment_Response_v2,
	Assignment_v2_With_Responses,
	AssignmentFormState,
	AssignmentResponseInfo,
} from '../assignment.types';
import AssignmentResponseEdit from '../views/AssignmentResponseEdit/AssignmentResponseEdit';

export type AssignmentPupilPreviewProps = {
	assignment: Partial<AssignmentFormState>;
	isPreview?: boolean;
	onClose: () => void;
};

const AssignmentPupilPreview: FC<AssignmentPupilPreviewProps & UserProps> = ({
	assignment,
	isPreview = false,
	onClose,
	user,
}) => {
	const { tText, tHtml } = useTranslation();
	const [assignmentResponse, setAssignmentResponse] = useState<AssignmentResponseInfo>({
		collection_title: '',
		pupil_collection_blocks: [],
		assignment_id: assignment.id as string,
		assignment: assignment as unknown as Assignment_Response_v2['assignment'],
		owner: {
			full_name: tText('assignment/components/assignment-pupil-preview___naam-leerling'),
		},
		owner_profile_id: user?.profile?.id,
		id: '///fake-assignment-response-id',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as AssignmentResponseInfo);

	const renderClosePreviewButton = () => (
		<Button
			icon="close"
			label={
				isMobileWidth()
					? undefined
					: tText('assignment/components/assignment-pupil-preview___sluit-preview')
			}
			ariaLabel={tText('assignment/components/assignment-pupil-preview___sluit-preview')}
			type="borderless-i"
			onClick={onClose}
		/>
	);
	return (
		<>
			<AlertBar
				icon="info"
				textLeft={tHtml(
					'assignment/components/assignment-pupil-preview___je-bent-aan-het-kijken-als-leerling'
				)}
				contentRight={renderClosePreviewButton()}
			/>
			{assignmentResponse && (
				<AssignmentResponseEdit
					assignment={assignment as Assignment_v2_With_Responses}
					assignmentResponse={assignmentResponse}
					setAssignmentResponse={
						setAssignmentResponse as Dispatch<
							SetStateAction<
								| (Omit<AssignmentResponseInfo, 'assignment' | 'id'> & {
										id: string | undefined;
								  })
								| null
							>
						>
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
