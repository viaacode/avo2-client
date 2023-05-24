import {
	Button,
	ButtonProps,
	Dropdown,
	DropdownButton,
	DropdownContent,
	IconName,
} from '@viaa/avo2-components';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';

import { ShareDropdown, ShareWithPupilsProps } from '../../shared/components';
import { ShareDropdownProps } from '../../shared/components/ShareDropdown/ShareDropdown';
import {
	ShareUserInfo,
	ShareUserInfoRights,
} from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import useTranslation from '../../shared/hooks/useTranslation';
// import { mockShareUsers } from '../../shared/mocks/share-user-mock';
import { AssignmentService } from '../assignment.service';

import DeleteAssignmentButton, { DeleteAssignmentButtonProps } from './DeleteAssignmentButton';
import DuplicateAssignmentButton, {
	DuplicateAssignmentButtonProps,
} from './DuplicateAssignmentButton';

interface AssignmentActionsProps {
	preview?: Partial<ButtonProps>;
	overflow?: Partial<ButtonProps>;
	share?: ShareWithPupilsProps;
	duplicate?: Partial<DuplicateAssignmentButtonProps>;
	remove?: Partial<DeleteAssignmentButtonProps>;
}

const AssignmentActions: FunctionComponent<AssignmentActionsProps> = ({
	preview,
	overflow,
	duplicate,
	remove,
	share,
}) => {
	const { tText } = useTranslation();
	const [isOverflowDropdownOpen, setOverflowDropdownOpen] = useState<boolean>(false);
	const [contributors, setContributors] = useState<ShareUserInfo[]>();

	console.log(contributors);

	useEffect(() => {
		if (share) {
			if (!isNil(share.assignment)) {
				const defaultContributors: ShareUserInfo[] = [
					{
						email: share.assignment.profile.user?.mail as string,
						rights: ShareUserInfoRights.OWNER,
						firstName: share.assignment.profile.user?.first_name as string | undefined,
						lastName: share.assignment.profile.user?.last_name as string | undefined,
						profileImage: share.assignment.profile.avatar as string | undefined,
						profileId: share.assignment.profile.id,
					},
				];
				const mappedContributors = share.assignment.contributors.map((contributor) => {
					return {
						email: contributor.profile.usersByuserId?.mail,
						rights: ShareUserInfoRights[
							contributor.enum_right_type.value as keyof typeof ShareUserInfoRights
						],
						firstName: contributor.profile.usersByuserId?.first_name,
						lastName: contributor.profile.usersByuserId?.last_name,
						profileImage: contributor.profile.avatar,
						profileId: contributor.profile.user_id,
					} as ShareUserInfo;
				});

				const mergedContributors = defaultContributors.concat(mappedContributors);

				setContributors(mergedContributors);
			}
		}
	}, [share]);

	const renderPreviewButton = (config?: Partial<ButtonProps>) => (
		<Button
			label={tText('assignment/views/assignment-edit___bekijk-als-leerling')}
			title={tText(
				'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
			)}
			ariaLabel={tText(
				'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
			)}
			type="secondary"
			{...preview}
			{...config}
		/>
	);

	const renderOverflowButton = (config?: Partial<ButtonProps>) => (
		<Button
			icon={IconName.moreHorizontal}
			type="secondary"
			ariaLabel={tText('assignment/views/assignment-detail___meer-opties')}
			title={tText('assignment/views/assignment-detail___meer-opties')}
			{...overflow}
			{...config}
		/>
	);

	const renderShareButton = (config?: Partial<ShareDropdownProps>) => (
		<div
			className={classNames(
				'c-assignment-heading__dropdown-wrapper',
				config?.button?.className
			)}
		>
			<ShareDropdown
				users={contributors}
				onDeleteUser={(value) => console.log(value)}
				onEditRights={(user, newRights) => console.log(user, newRights)}
				onAddNewUser={(info) =>
					AssignmentService.addShareAssignmentUser(share?.assignment?.id, info)
				}
				{...config}
				share={share}
			/>
		</div>
	);

	const renderDuplicateButton = (config?: Partial<DuplicateAssignmentButtonProps>) => (
		<DuplicateAssignmentButton
			{...duplicate}
			{...config}
			onClick={(e) => {
				duplicate?.onClick?.(e);
				config?.onClick?.(e);

				setOverflowDropdownOpen(false);
			}}
		/>
	);

	const renderDeleteButton = (config?: Partial<DeleteAssignmentButtonProps>) => (
		<DeleteAssignmentButton
			{...remove}
			{...config}
			// Allow merging of configs
			button={{
				...remove?.button,
				...config?.button,
			}}
		/>
	);

	return useMemo(
		() => (
			<>
				{renderPreviewButton({
					className: 'c-assignment-heading__hide-on-mobile',
				})}

				<div className="c-assignment-heading__dropdown-wrapper">
					<Dropdown
						isOpen={isOverflowDropdownOpen}
						onClose={() => setOverflowDropdownOpen(false)}
						placement="bottom-end"
					>
						<DropdownButton>
							{renderOverflowButton({
								onClick: () => setOverflowDropdownOpen(!isOverflowDropdownOpen),
							})}
						</DropdownButton>

						<DropdownContent>
							{renderPreviewButton({
								block: true,
								className: 'c-assignment-heading__show-on-mobile',
								icon: IconName.eye,
								type: 'borderless',
							})}
							{renderDuplicateButton({ block: true, type: 'borderless' })}
							{renderDeleteButton({ button: { block: true, type: 'borderless' } })}
							{renderShareButton({
								dropdown: {
									placement: 'bottom-end',
								},
								button: {
									block: true,
									className: 'c-assignment-heading__show-on-mobile',
									icon: IconName.share2,
									type: 'borderless',
								},
							})}
						</DropdownContent>
					</Dropdown>
				</div>

				{renderShareButton({
					button: {
						className: 'c-assignment-heading__hide-on-mobile',
					},
				})}
			</>
		),
		[tText, isOverflowDropdownOpen]
	);
};

export default AssignmentActions;
