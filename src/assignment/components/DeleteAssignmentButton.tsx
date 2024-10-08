import { Button, type ButtonProps, type DefaultProps, IconName } from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import React, { type FC, useState } from 'react';
import { compose } from 'redux';

import { PermissionService } from '../../authentication/helpers/permission-service';
import { DeleteObjectModal } from '../../shared/components';
import { type ConfirmModalProps } from '../../shared/components/ConfirmModal/ConfirmModal';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import { deleteAssignment, deleteAssignmentWarning } from '../helpers/delete-assignment';

export type DeleteAssignmentButtonProps = DefaultProps &
	Partial<UserProps> & {
		assignment?: Avo.Assignment.Assignment;
		button?: Partial<ButtonProps>;
		modal?: Partial<ConfirmModalProps>;
	};

const DeleteAssignmentButton: FC<DeleteAssignmentButtonProps> = ({
	assignment,
	button,
	modal,
	commonUser,
}) => {
	const { tText } = useTranslation();

	const [isOpen, setOpen] = useState<boolean>(false);
	const canDeleteAnyAssignments = PermissionService.hasPerm(
		commonUser,
		PermissionName.DELETE_ANY_ASSIGNMENTS
	);
	const isOwner =
		!!assignment?.owner_profile_id && assignment?.owner_profile_id === commonUser?.profileId;

	const onConfirm = async () => {
		if (!commonUser?.profileId) {
			ToastService.danger(
				tText(
					'assignment/components/delete-assignment-button___je-moet-ingelogd-zijn-om-een-opdracht-te-verwijderen'
				)
			);
			return;
		}

		assignment && (await deleteAssignment(assignment, commonUser));

		setOpen(false);
		modal?.confirmCallback && modal.confirmCallback();
	};

	return (
		<>
			<Button
				altTitle={tText(
					'assignment/components/delete-assignment-button___verwijder-de-opdracht'
				)}
				ariaLabel={tText(
					'assignment/components/delete-assignment-button___verwijder-de-opdracht'
				)}
				icon={IconName.delete}
				label={
					canDeleteAnyAssignments || isOwner
						? tText('assignment/components/delete-assignment-button___verwijderen')
						: tText(
								'assignment/components/delete-assignment-button___verwijder-mij-van-deze-opdracht'
						  )
				}
				title={tText(
					'assignment/components/delete-assignment-button___verwijder-de-opdracht'
				)}
				type="borderless"
				{...button}
				onClick={(e) => {
					setOpen(true);
					button?.onClick && button.onClick(e);
				}}
			/>
			<DeleteObjectModal
				title={tText(
					'assignment/views/assignment-overview___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
				)}
				body={deleteAssignmentWarning(assignment, commonUser?.profileId)}
				{...modal}
				isOpen={isOpen}
				onClose={() => {
					setOpen(false);
					modal?.onClose && modal.onClose();
				}}
				confirmCallback={async () => await onConfirm()}
			/>
		</>
	);
};

export default compose(withUser)(DeleteAssignmentButton) as FC<DeleteAssignmentButtonProps>;
