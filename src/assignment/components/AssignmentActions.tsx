import {
	Button,
	ButtonProps,
	Dropdown,
	DropdownButton,
	DropdownContent,
} from '@viaa/avo2-components';
import classNames from 'classnames';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteAssignmentButton, { DeleteAssignmentButtonProps } from './DeleteAssignmentButton';
import DuplicateAssignmentButton, {
	DuplicateAssignmentButtonProps,
} from './DuplicateAssignmentButton';
import {
	ShareAssignmentWithPupil,
	ShareAssignmentWithPupilProps,
} from './ShareAssignmentWithPupil';

interface AssignmentActionsProps {
	preview?: Partial<ButtonProps>;
	overflow?: Partial<ButtonProps>;
	share?: ShareAssignmentWithPupilProps;
	duplicate?: Partial<DuplicateAssignmentButtonProps>;
	remove?: Partial<DeleteAssignmentButtonProps>;
}

const AssignmentActions: FunctionComponent<AssignmentActionsProps> = ({
	preview,
	overflow,
	share,
	duplicate,
	remove,
}) => {
	const [t] = useTranslation();
	const [isOverflowDropdownOpen, setOverflowDropdownOpen] = useState<boolean>(false);

	const renderPreviewButton = (config?: Partial<ButtonProps>) => (
		<Button
			label={t('assignment/views/assignment-edit___bekijk-als-leerling')}
			title={t(
				'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
			)}
			ariaLabel={t(
				'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
			)}
			type="secondary"
			{...preview}
			{...config}
		/>
	);

	const renderOverflowButton = (config?: Partial<ButtonProps>) => (
		<Button
			icon="more-horizontal"
			type="secondary"
			ariaLabel={t('assignment/views/assignment-detail___meer-opties')}
			title={t('assignment/views/assignment-detail___meer-opties')}
			{...overflow}
			{...config}
		/>
	);

	const renderShareButton = (config?: ShareAssignmentWithPupilProps) => (
		<div
			className={classNames(
				'c-assignment-heading__dropdown-wrapper',
				config?.button?.className
			)}
		>
			<ShareAssignmentWithPupil {...share} {...config} />
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

	const renderActions = useMemo(
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
								icon: 'eye',
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
									icon: 'share-2',
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
		[t, isOverflowDropdownOpen]
	);

	return renderActions;
};

export default AssignmentActions;