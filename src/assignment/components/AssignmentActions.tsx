import {
	Button,
	ButtonProps,
	Dropdown,
	DropdownButton,
	DropdownContent,
	IconName,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import classNames from 'classnames';
import { noop, omit } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { APP_PATH } from '../../constants';
import { ShareDropdown, ShareWithPupilsProps } from '../../shared/components';
import { ShareDropdownProps } from '../../shared/components/ShareDropdown/ShareDropdown';
import { isMobileWidth } from '../../shared/helpers';
import { transformContributorsToSimpleContributors } from '../../shared/helpers/contributors';
import useTranslation from '../../shared/hooks/useTranslation';
import { AssignmentService } from '../assignment.service';
import {
	onAddNewContributor,
	onDeleteContributor,
	onEditContributor,
} from '../helpers/assignment-share-with-collegue-handlers';

import DeleteAssignmentButton, { DeleteAssignmentButtonProps } from './DeleteAssignmentButton';
import DuplicateAssignmentButton, {
	DuplicateAssignmentButtonProps,
} from './DuplicateAssignmentButton';

interface AssignmentActionsProps {
	preview?: Partial<ButtonProps>;
	overflow?: Partial<ButtonProps>;
	shareWithPupilsProps?: ShareWithPupilsProps;
	duplicate?: Partial<DuplicateAssignmentButtonProps>;
	remove?: Partial<DeleteAssignmentButtonProps>;
	refetchAssignment?: () => void;
	publish?: Partial<ButtonProps>;
	route: string;
}

const AssignmentActions: FunctionComponent<AssignmentActionsProps> = ({
	preview,
	overflow,
	duplicate,
	remove,
	shareWithPupilsProps,
	refetchAssignment = noop,
	publish,
	route,
}) => {
	const { tText } = useTranslation();
	const [isOverflowDropdownOpen, setOverflowDropdownOpen] = useState<boolean>(false);
	const [contributors, setContributors] = useState<Avo.Assignment.Contributor[]>();
	const fetchContributors = useCallback(async () => {
		if (!shareWithPupilsProps?.assignment?.id) {
			return;
		}
		const response = await AssignmentService.fetchContributorsByAssignmentId(
			shareWithPupilsProps?.assignment?.id
		);

		setContributors((response || []) as Avo.Assignment.Contributor[]);
	}, [shareWithPupilsProps]);

	useEffect(() => {
		fetchContributors();
	}, [fetchContributors]);

	const renderPreviewButton = (buttonProps?: Partial<ButtonProps>) => (
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
			{...buttonProps}
		/>
	);

	const renderOverflowButton = (buttonProps?: Partial<ButtonProps>) => (
		<Button
			icon={IconName.moreHorizontal}
			type="secondary"
			ariaLabel={tText('assignment/views/assignment-detail___meer-opties')}
			title={tText('assignment/views/assignment-detail___meer-opties')}
			{...overflow}
			{...buttonProps}
		/>
	);

	const renderPublishButton = (buttonProps?: Partial<ButtonProps>) => {
		if (route !== APP_PATH.ASSIGNMENT_CREATE.route) {
			return (
				<Button
					type="secondary"
					{...(isMobileWidth() ? buttonProps : omit(buttonProps, ['label']))}
				/>
			);
		}
	};

	const renderShareButton = (shareDropdownProps?: Partial<ShareDropdownProps>) => {
		if (route !== APP_PATH.ASSIGNMENT_CREATE.route && shareWithPupilsProps?.assignment?.owner) {
			return (
				<div
					className={classNames(
						'c-assignment-heading__dropdown-wrapper',
						shareDropdownProps?.buttonProps?.className
					)}
				>
					<ShareDropdown
						contributors={transformContributorsToSimpleContributors(
							shareWithPupilsProps?.assignment?.owner as Avo.User.User,
							contributors as Avo.Assignment.Contributor[]
						)}
						onDeleteContributor={(info) =>
							onDeleteContributor(info, shareWithPupilsProps, fetchContributors)
						}
						onEditContributorRights={(contributorInfo, newRights) =>
							onEditContributor(
								contributorInfo,
								newRights,
								shareWithPupilsProps,
								fetchContributors,
								refetchAssignment
							)
						}
						onAddContributor={(info) =>
							onAddNewContributor(info, shareWithPupilsProps, fetchContributors)
						}
						{...shareDropdownProps}
						shareWithPupilsProps={shareWithPupilsProps}
					/>
				</div>
			);
		}
	};

	const renderDuplicateButton = (
		duplicateAssignmentButtonProps?: Partial<DuplicateAssignmentButtonProps>
	) => (
		<DuplicateAssignmentButton
			{...duplicate}
			{...duplicateAssignmentButtonProps}
			onClick={(e) => {
				duplicate?.onClick?.(e);
				duplicateAssignmentButtonProps?.onClick?.(e);

				setOverflowDropdownOpen(false);
			}}
		/>
	);

	const renderDeleteButton = (
		deleteAssignmentButtonProps?: Partial<DeleteAssignmentButtonProps>
	) => (
		<DeleteAssignmentButton
			{...remove}
			{...deleteAssignmentButtonProps}
			// Allow merging of configs
			button={{
				...remove?.button,
				...deleteAssignmentButtonProps?.button,
			}}
		/>
	);

	return useMemo(
		() => (
			<>
				{renderPreviewButton({
					className: 'c-assignment-heading__hide-on-mobile',
				})}

				{renderPublishButton({
					...publish,
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
							{renderPublishButton({
								...publish,
								block: true,
								className: 'c-assignment-heading__show-on-mobile',
								icon: IconName.userGroup,
								type: 'borderless',
							})}
							{renderShareButton({
								dropdownProps: {
									placement: 'bottom-end',
								},
								buttonProps: {
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
					dropdownProps: {
						placement: 'bottom-end',
					},
					buttonProps: {
						className: 'c-assignment-heading__hide-on-mobile',
					},
				})}
			</>
		),
		[tText, isOverflowDropdownOpen, contributors]
	);
};

export default AssignmentActions;
