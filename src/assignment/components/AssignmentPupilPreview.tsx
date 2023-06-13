import { Button, IconName } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { Dispatch, FC, FunctionComponent, SetStateAction, useState } from 'react';

import AlertBar from '../../shared/components/AlertBar/AlertBar';
import { isMobileWidth } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import AssignmentResponseEdit from '../views/AssignmentResponseEdit/AssignmentResponseEdit';

export type AssignmentPupilPreviewProps = {
	assignment: Partial<Avo.Assignment.Assignment>;
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
	const [assignmentResponse, setAssignmentResponse] = useState<Avo.Assignment.Response>({
		collection_title: '',
		pupil_collection_blocks: [],
		assignment_id: assignment.id as string,
		assignment: assignment as unknown as Avo.Assignment.Assignment,
		owner: {
			full_name: tText('assignment/components/assignment-pupil-preview___naam-leerling'),
		},
		owner_profile_id: user?.profile?.id,
		id: '///fake-assignment-response-id',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	} as Avo.Assignment.Response);

	const renderClosePreviewButton = () => (
		<Button
			icon={IconName.close}
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
				icon={IconName.info}
				textLeft={tHtml(
					'assignment/components/assignment-pupil-preview___je-bent-aan-het-kijken-als-leerling'
				)}
				contentRight={renderClosePreviewButton()}
			/>
			{assignmentResponse && (
				<AssignmentResponseEdit
					assignment={assignment as Avo.Assignment.Assignment}
					assignmentResponse={assignmentResponse}
					setAssignmentResponse={
						setAssignmentResponse as Dispatch<
							SetStateAction<
								| (Omit<Avo.Assignment.Response, 'assignment' | 'id'> & {
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
