import {
	Alert,
	Button,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Flex,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { APP_PATH } from '../../constants';
import { buildLink, copyToClipboard } from '../../shared/helpers';
import { ToastService } from '../../shared/services';

import './ShareAssignmentWithPupil.scss';

export type ShareAssignmentWithPupilProps = {
	assignment: Avo.Assignment.Assignment_v2;
	onDetailLinkClicked: () => void;
	onContentLinkClicked: () => void;
};

export const ShareAssignmentWithPupil: FC<ShareAssignmentWithPupilProps> = ({
	assignment,
	onDetailLinkClicked,
	onContentLinkClicked,
}) => {
	const [t] = useTranslation();

	// UI

	const [isShareDropdownOpen, setIsShareDropdownOpen] = useState<boolean>(false);

	// Computed

	const assignmentShareLink: string =
		window.location.origin +
		buildLink(APP_PATH.ASSIGNMENT_RESPONSE_DETAIL.route, {
			id: assignment.id,
		});
	const isAssignmentDetailsComplete =
		!!assignment?.labels.filter((l) => l.assignment_label.type === 'CLASS')?.length &&
		!!assignment?.labels.filter((l) => l.assignment_label.type === 'LABEL')?.length &&
		!!assignment?.available_at &&
		!!assignment?.deadline_at &&
		!!assignment?.blocks?.length;
	const hasAssignmentContent = !!assignment?.blocks?.length;

	// Events

	const handleShareButtonClicked = () => {
		setIsShareDropdownOpen(true);
	};

	const handleCopyButtonClicked = () => {
		copyToClipboard(assignmentShareLink);
		setIsShareDropdownOpen(false);
		ToastService.success(
			t(
				'assignment/components/share-assignment-with-pupil___de-link-is-naar-je-klembord-gekopieerd'
			)
		);
	};

	const handleContentLinkClicked = () => {
		onContentLinkClicked();
		setIsShareDropdownOpen(false);
	};

	const handleDetailLinkClicked = () => {
		onDetailLinkClicked();
		setIsShareDropdownOpen(false);
	};

	return (
		<Dropdown
			isOpen={isShareDropdownOpen}
			onClose={() => setIsShareDropdownOpen(false)}
			placement="bottom-end"
		>
			<DropdownButton>
				<Button
					ariaLabel={t('assignment/views/assignment-create___delen-met-leerlingen')}
					label={t('assignment/views/assignment-create___delen-met-leerlingen')}
					title={t(
						'assignment/components/share-assignment-with-pupil___bezorg-deze-opdrachtlink-aan-je-leerlingen'
					)}
					onClick={handleShareButtonClicked}
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
							label={t('assignment/components/share-assignment-with-pupil___kopieer')}
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
												{t(
													'assignment/components/share-assignment-with-pupil___link-nog-niet-deelbaar'
												)}
											</strong>
										</h4>
										{!hasAssignmentContent && (
											<p>
												{t(
													'assignment/components/share-assignment-with-pupil___deze-opdracht-bevat-nog-geen'
												) + ' '}
												<Button
													label={t(
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
												{t(
													'assignment/components/share-assignment-with-pupil___vul-de-ontbrekende-informatie-onder'
												) + ' '}
												<Button
													label={t(
														'assignment/components/share-assignment-with-pupil___details'
													)}
													type="inline-link"
													onClick={handleDetailLinkClicked}
												/>
												{' ' +
													t(
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
