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
import { noop } from 'lodash-es';
import React, { FunctionComponent, useMemo, useState } from 'react';

import { APP_PATH } from '../../constants';
import { ShareDropdown, ShareWithPupilsProps } from '../../shared/components';
import { ShareDropdownProps } from '../../shared/components/ShareDropdown/ShareDropdown';
import { isMobileWidth } from '../../shared/helpers';
import { transformContributorsToSimpleContributors } from '../../shared/helpers/contributors';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	onAddNewContributor,
	onDeleteContributor,
	onEditContributor,
} from '../helpers/assignment-share-with-collegue-handlers';

import DeleteAssignmentButton, { DeleteAssignmentButtonProps } from './DeleteAssignmentButton';
import DuplicateAssignmentButton, {
	DuplicateAssignmentButtonProps,
} from './DuplicateAssignmentButton';

interface ShareProps extends ShareWithPupilsProps {
	contributors: Avo.Assignment.Contributor[];
	onClickMobile: () => void;
	fetchContributors: () => void;
}

interface AssignmentActionsProps {
	preview?: Partial<ButtonProps>;
	overflow?: Partial<ButtonProps>;
	share?: ShareProps;
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
	share,
	refetchAssignment = noop,
	publish,
	route,
}) => {
	const { tText } = useTranslation();
	const [isOverflowDropdownOpen, setOverflowDropdownOpen] = useState<boolean>(false);

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
			return <Button type="secondary" {...buttonProps} />;
		}
	};

	const renderShareButton = (shareDropdownProps?: Partial<ShareDropdownProps>) => {
		if (route !== APP_PATH.ASSIGNMENT_CREATE.route && share?.assignment?.owner) {
			if (isMobileWidth()) {
				return (
					<Button
						label={tText('Delen')}
						title={tText("Deel de opdracht met leerlingen of collega's")}
						ariaLabel={tText("Deel de opdracht met leerlingen of collega's")}
						type="secondary"
						{...shareDropdownProps?.buttonProps}
						onClick={() => share.onClickMobile()}
					/>
				);
			}
			return (
				<div
					className={classNames(
						'c-assignment-heading__dropdown-wrapper',
						shareDropdownProps?.buttonProps?.className
					)}
				>
					<ShareDropdown
						contributors={transformContributorsToSimpleContributors(
							share?.assignment?.owner as Avo.User.User,
							share.contributors as Avo.Assignment.Contributor[]
						)}
						onDeleteContributor={(info) =>
							onDeleteContributor(info, share, share.fetchContributors)
						}
						onEditContributorRights={(contributorInfo, newRights) =>
							onEditContributor(
								contributorInfo,
								newRights,
								share,
								share.fetchContributors,
								refetchAssignment
							)
						}
						onAddContributor={(info) =>
							onAddNewContributor(info, share, share.fetchContributors)
						}
						{...shareDropdownProps}
						shareWithPupilsProps={share}
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
								type: 'borderless',
							})}
							{renderShareButton({
								dropdownProps: {
									placement: 'bottom-end',
								},
								buttonProps: {
									block: true,
									className: 'c-assignment-heading__show-on-mobile',
									icon: IconName.userGroup,
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
		[tText, isOverflowDropdownOpen]
	);
};

export default AssignmentActions;
