import { Alert, Button, Flex, IconName, Spacer, TextInput } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import React, { type FC } from 'react';

import { APP_PATH } from '../../../constants';
import { buildLink, copyToClipboard } from '../../helpers';
import { useAssignmentPastDeadline } from '../../hooks/useAssignmentPastDeadline';
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

	const isAssignmentExpired = useAssignmentPastDeadline(assignment);

	// Computed
	const assignmentShareLink: string = assignment
		? window.location.origin +
		  buildLink(APP_PATH.ASSIGNMENT_RESPONSE_DETAIL.route, {
				id: assignment.id,
		  })
		: '';

	// https://meemoo.atlassian.net/browse/AVO-2819
	// https://meemoo.atlassian.net/browse/AVO-2051
	const isAssignmentDetailsComplete = !!assignment?.available_at && !!assignment?.deadline_at;

	const hasAssignmentContent = !!assignment?.blocks?.length;

	const canCopy = !isAssignmentExpired && hasAssignmentContent && isAssignmentDetailsComplete;

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
			className={classnames('c-share-with-pupil', {
				['c-share-with-pupil--disabled']: !canCopy,
			})}
		>
			<Flex>
				<TextInput value={assignmentShareLink} />
				<Button
					label={tText('assignment/components/share-assignment-with-pupil___kopieer')}
					icon={IconName.copy}
					onClick={handleCopyButtonClicked}
					disabled={!canCopy}
					type="tertiary"
				/>
			</Flex>
			{!canCopy && (
				<>
					<Spacer margin="bottom" />
					<Alert
						type="info"
						message={
							<>
								<h4>
									<strong>
										{!isAssignmentExpired &&
											(!hasAssignmentContent ||
												!isAssignmentDetailsComplete) &&
											tText(
												'assignment/components/share-assignment-with-pupil___link-nog-niet-deelbaar'
											)}
										{isAssignmentExpired &&
											tText(
												'assignment/components/share-assignment-with-pupil___opdracht-is-verlopen--titel'
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
								{isAssignmentExpired && (
									<p>
										{tHtml(
											'assignment/components/share-assignment-with-pupil___opdracht-is-verlopen--beschrijving'
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
