import {
	Button,
	ButtonProps,
	Dropdown,
	DropdownButton,
	DropdownContent,
	IconName,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import classNames from 'classnames';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { ShareDropdown } from '../../shared/components';
import { ShareDropdownProps } from '../../shared/components/ShareDropdown/ShareDropdown';
import {
	ContributorInfo,
	ShareRightsType,
} from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import { ShareWithPupilsProps } from '../../shared/components/ShareWithPupils/ShareWithPupils';
import { transformContributorsToSimpleContributors } from '../../shared/helpers/transform-contributors';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import { Contributor } from '../../shared/types/contributor';
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
	refetch?: () => void;
}

const AssignmentActions: FunctionComponent<AssignmentActionsProps> = ({
	preview,
	overflow,
	duplicate,
	remove,
	share,
	refetch,
}) => {
	const { tText } = useTranslation();
	const [isOverflowDropdownOpen, setOverflowDropdownOpen] = useState<boolean>(false);
	const [contributors, setContributors] = useState<Contributor[]>();

	const fetchContributors = useCallback(async () => {
		if (!share?.assignment?.id) {
			return;
		}
		const response = await AssignmentService.fetchContributorsByAssignmentId(
			share?.assignment?.id
		);

		setContributors(response as Contributor[]);
	}, [share]);

	useEffect(() => {
		fetchContributors();
	}, [fetchContributors]);

	const onEditContributor = async (contributor: ContributorInfo, newRights: ShareRightsType) => {
		try {
			if (share && refetch) {
				if (newRights === 'OWNER') {
					await AssignmentService.transferAssignmentOwnerShip(
						share.assignment?.id,
						contributor.contributorId as string
					);

					await refetch();

					ToastService.success(
						tText(
							'assignment/components/assignment-actions___eigenaarschap-is-succesvol-overgedragen'
						)
					);
				} else {
					await AssignmentService.editContributorRights(
						share.assignment?.id,
						contributor.contributorId as string,
						newRights
					);

					await fetchContributors();

					ToastService.success(
						tText(
							'assignment/components/assignment-actions___rol-van-de-gebruiker-is-aangepast'
						)
					);
				}
			}
		} catch (err) {
			ToastService.danger(
				tText(
					'assignment/components/assignment-actions___er-liep-iets-fout-met-het-aanpassen-van-de-collega-rol'
				)
			);
		}
	};

	const onAddNewContributor = async (info: Partial<ContributorInfo>) => {
		try {
			await AssignmentService.addContributor(share?.assignment?.id, info);

			await fetchContributors();

			ToastService.success(
				tText(
					'assignment/components/assignment-actions___uitnodiging-tot-samenwerken-is-verstuurd'
				)
			);
		} catch (err) {
			ToastService.danger(
				tText(
					'assignment/components/assignment-actions___er-liep-iets-fout-met-het-uitnodigen-van-een-collega'
				)
			);
		}
	};

	const onDeleteContributor = async (info: ContributorInfo) => {
		try {
			await AssignmentService.deleteContributor(
				share?.assignment?.id,
				info.contributorId,
				info.profileId
			);

			await fetchContributors();

			ToastService.success(
				tText(
					'assignment/components/assignment-actions___gebruiker-is-verwijderd-van-de-opdracht'
				)
			);
		} catch (err) {
			ToastService.danger(
				tText(
					'assignment/components/assignment-actions___er-liep-iets-fout-met-het-verwijderen-van-een-collega'
				)
			);
		}
	};

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
				contributors={transformContributorsToSimpleContributors(
					share?.assignment?.owner as Avo.User.User,
					contributors as Contributor[]
				)}
				onDeleteContributor={onDeleteContributor}
				onEditContributorRights={onEditContributor}
				onAddContributor={onAddNewContributor}
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
					dropdown: {
						placement: 'bottom-end',
					},
					button: {
						className: 'c-assignment-heading__hide-on-mobile',
					},
				})}
			</>
		),
		[tText, isOverflowDropdownOpen, contributors]
	);
};

export default AssignmentActions;
