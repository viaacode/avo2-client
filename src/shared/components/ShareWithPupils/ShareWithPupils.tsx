import { Alert, Button, Flex, IconName, Spacer, TextInput } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import React, { FC } from 'react';

import { APP_PATH } from '../../../constants';
import { buildLink, copyToClipboard } from '../../helpers';
import useTranslation from '../../hooks/useTranslation';
import { ToastService } from '../../services/toast-service';

import './ShareWithPupils.scss';

export type ShareWithPupilsProps = {
	assignment?: Avo.Assignment.Assignment;
	onDetailLinkClicked?: () => void;
	onContentLinkClicked?: () => void;
};

export const ShareWithPupil: FC<ShareWithPupilsProps> = ({
	assignment,
	onDetailLinkClicked,
	onContentLinkClicked,
}) => {
	const { tText, tHtml } = useTranslation();

	// Computed
	const assignmentShareLink: string = assignment
		? window.location.origin +
		  buildLink(APP_PATH.ASSIGNMENT_RESPONSE_DETAIL.route, {
				id: assignment.id,
		  })
		: '';
	const isAssignmentDetailsComplete =
		!!(assignment?.labels || []).filter(
			(l: { assignment_label: Avo.Assignment.Label }) => l.assignment_label.type === 'CLASS'
		)?.length &&
		// Disabled due to https://meemoo.atlassian.net/browse/AVO-2051
		// !!assignment?.labels.filter((l) => l.assignment_label.type === 'LABEL')?.length &&
		!!assignment?.available_at &&
		!!assignment?.deadline_at;
	const hasAssignmentContent = !!assignment?.blocks?.length;

	const handleCopyButtonClicked = () => {
		copyToClipboard(assignmentShareLink);
		ToastService.success(
			tHtml(
				'assignment/components/share-assignment-with-pupil___de-link-is-naar-je-klembord-gekopieerd'
			)
		);
	};

	const handleContentLinkClicked = () => {
		onContentLinkClicked?.();
	};

	const handleDetailLinkClicked = () => {
		onDetailLinkClicked?.();
	};

	return (
		<div
			className={classnames('c-share-assignment-with-pupil-popup', {
				['c-share-assignment-with-pupil-popup--disabled']:
					!hasAssignmentContent || !isAssignmentDetailsComplete,
			})}
		>
			<Flex>
				<TextInput value={assignmentShareLink} />
				<Button
					label={tText('assignment/components/share-assignment-with-pupil___kopieer')}
					icon={IconName.copy}
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
	);
};
