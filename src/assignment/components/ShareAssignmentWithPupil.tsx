import {
	Alert,
	Button,
	ButtonProps,
	Dropdown,
	DropdownButton,
	DropdownContent,
	DropdownProps,
	Flex,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';
import classnames from 'classnames';
import React, { FC, useState } from 'react';

import { APP_PATH } from '../../constants';
import { buildLink, copyToClipboard } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import { Assignment_v2_With_Blocks, Assignment_v2_With_Labels } from '../assignment.types';

import './ShareAssignmentWithPupil.scss';

export type ShareAssignmentWithPupilProps = {
	assignment?: Assignment_v2_With_Labels & Assignment_v2_With_Blocks;
	onDetailLinkClicked?: () => void;
	onContentLinkClicked?: () => void;
	button?: Partial<ButtonProps>;
	dropdown?: Partial<DropdownProps>;
};

export const ShareAssignmentWithPupil: FC<ShareAssignmentWithPupilProps> = ({
	assignment,
	onDetailLinkClicked,
	onContentLinkClicked,
	button,
	dropdown,
}) => {
	const { tText, tHtml } = useTranslation();

	// UI

	const [isShareDropdownOpen, setIsShareDropdownOpen] = useState<boolean>(false);

	// Computed

	const assignmentShareLink: string = assignment
		? window.location.origin +
		  buildLink(APP_PATH.ASSIGNMENT_RESPONSE_DETAIL.route, {
				id: assignment.id,
		  })
		: '';
	const isAssignmentDetailsComplete =
		!!assignment?.labels.filter((l) => l.assignment_label.type === 'CLASS')?.length &&
		// Disabled due to https://meemoo.atlassian.net/browse/AVO-2051
		// !!assignment?.labels.filter((l) => l.assignment_label.type === 'LABEL')?.length &&
		!!assignment?.available_at &&
		!!assignment?.deadline_at;
	const hasAssignmentContent = !!assignment?.blocks?.length;

	// Events

	const handleShareButtonClicked = () => {
		setIsShareDropdownOpen(true);
	};

	const handleCopyButtonClicked = () => {
		copyToClipboard(assignmentShareLink);
		setIsShareDropdownOpen(false);
		ToastService.success(
			tHtml(
				'assignment/components/share-assignment-with-pupil___de-link-is-naar-je-klembord-gekopieerd'
			)
		);
	};

	const handleContentLinkClicked = () => {
		onContentLinkClicked?.();
		setIsShareDropdownOpen(false);
	};

	const handleDetailLinkClicked = () => {
		onDetailLinkClicked?.();
		setIsShareDropdownOpen(false);
	};

	return (
		<Dropdown
			isOpen={isShareDropdownOpen}
			onClose={() => setIsShareDropdownOpen(false)}
			placement="bottom-end"
			{...dropdown}
		>
			<DropdownButton>
				<Button
					ariaLabel={tText('assignment/views/assignment-create___delen-met-leerlingen')}
					label={tText('assignment/views/assignment-create___delen-met-leerlingen')}
					title={tText(
						'assignment/components/share-assignment-with-pupil___bezorg-deze-opdrachtlink-aan-je-leerlingen'
					)}
					onClick={handleShareButtonClicked}
					{...button}
					disabled={button?.disabled || assignmentShareLink.length === 0}
				/>
			</DropdownButton>
			<DropdownContent>
				<div
					className={classnames('c-share-assignment-with-pupil-popup', {
						['c-share-assignment-with-pupil-popup--disabled']:
							!hasAssignmentContent || !isAssignmentDetailsComplete,
					})}
				>
					<Flex>
						<TextInput value={assignmentShareLink} />
						<Button
							label={tText(
								'assignment/components/share-assignment-with-pupil___kopieer'
							)}
							icon="copy"
							onClick={handleCopyButtonClicked}
							type="tertiary"
						/>
					</Flex>
					{(!isAssignmentDetailsComplete || !hasAssignmentContent) && (
						<>
							<Spacer margin="bottom" />
							<Alert
								type="info"
								message={
									<>
										<h4>
											<strong>
												{tText(
													'assignment/components/share-assignment-with-pupil___link-nog-niet-deelbaar'
												)}
											</strong>
										</h4>
										{!hasAssignmentContent && (
											<p>
												{tText(
													'assignment/components/share-assignment-with-pupil___deze-opdracht-bevat-nog-geen'
												) + ' '}
												<Button
													label={tText(
														'assignment/components/share-assignment-with-pupil___inhoud'
													)}
													type="inline-link"
													onClick={handleContentLinkClicked}
												/>
												{'.'}
											</p>
										)}
										{!isAssignmentDetailsComplete && (
											<p>
												{tText(
													'assignment/components/share-assignment-with-pupil___vul-de-ontbrekende-informatie-onder'
												) + ' '}
												<Button
													label={tText(
														'assignment/components/share-assignment-with-pupil___details'
													)}
													type="inline-link"
													onClick={handleDetailLinkClicked}
												/>
												{' ' +
													tText(
														'assignment/components/share-assignment-with-pupil___aan'
													)}
											</p>
										)}
									</>
								}
							/>
						</>
					)}
				</div>
			</DropdownContent>
		</Dropdown>
	);
};
