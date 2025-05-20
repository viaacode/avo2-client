import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import { Box, Button, Flex, FlexItem, Spacer, TextInput } from '@viaa/avo2-components';
import React, { type FC, useState } from 'react';

import withUser, { type UserProps } from '../../hocs/withUser';
import useTranslation from '../../hooks/useTranslation';
import {
	CampaignMonitorService,
	type EmailTemplateType,
} from '../../services/campaign-monitor-service';
import { trackEvents } from '../../services/event-logging-service';
import { ToastService } from '../../services/toast-service';

import './ShareThroughEmailContent.scss';
import { copyToClipboard } from '../../helpers/clipboard';

interface AddToCollectionModalProps {
	type: EmailTemplateType;
	emailLinkHref: string;
	emailLinkTitle: string;
	onSendMail: () => void;
}

const ShareThroughEmailContent: FC<AddToCollectionModalProps & UserProps> = ({
	type,
	emailLinkHref,
	emailLinkTitle,
	onSendMail,
	user,
}) => {
	const { tText, tHtml } = useTranslation();

	const [emailAddress, setEmailAddress] = useState<string>('');
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const copyLink = () => {
		copyToClipboard(emailLinkHref);

		trackEvents(
			{
				object: (emailLinkHref.split('/').pop() || '').split('?')[0] || '',
				object_type: type,
				action: 'share',
				resource: {
					object_type: 'link',
				},
			},
			user
		);

		ToastService.success(
			tHtml(
				'shared/components/share-through-email-modal/share-through-email-modal___de-url-is-naar-het-klembord-gekopieerd'
			)
		);
	};

	const sendEmail = async () => {
		try {
			setIsProcessing(true);
			await CampaignMonitorService.shareThroughEmail(
				emailAddress,
				emailLinkTitle,
				emailLinkHref,
				type
			);

			trackEvents(
				{
					object: (emailLinkHref.split('/').pop() || '').split('?')[0] || '',
					object_type: type,
					action: 'share',
					resource: {
						object_type: 'mail',
					},
				},
				user
			);

			ToastService.success(
				tHtml(
					'shared/components/share-through-email-modal/share-through-email-modal___de-email-is-verstuurd'
				)
			);

			// close modal when email is sent
			onSendMail();
		} catch (err) {
			console.error('Failed to send email to share item', err, {
				emailAddress,
				emailLinkTitle,
				emailLinkHref,
				type,
			});
			ToastService.danger('Het versturen van de email is mislukt');
		}
		setIsProcessing(false);
	};

	return (
		<>
			<BlockHeading type="h4">
				{tHtml(
					'shared/components/share-through-email-modal/share-through-email-modal___kopieer-deze-publieke-link'
				)}
			</BlockHeading>
			<p>
				{tText(
					'shared/components/share-through-email-modal/share-through-email-modal___waarschuwing-deel-link-via-email'
				)}
			</p>
			<Spacer margin={['top-large', 'bottom-large']}>
				<Box backgroundColor="gray" condensed>
					<Flex wrap justify="between" align="baseline">
						<FlexItem className="u-truncate c-share-through-email-modal__link">
							<a href={emailLinkHref}>{emailLinkHref}</a>
						</FlexItem>
						<FlexItem shrink>
							<Spacer margin="left-small">
								<Button
									label={tText(
										'shared/components/share-through-email-modal/share-through-email-modal___kopieer-link'
									)}
									onClick={copyLink}
								/>
							</Spacer>
						</FlexItem>
					</Flex>
				</Box>
			</Spacer>
			<BlockHeading type="h4">
				{tHtml(
					'shared/components/share-through-email-modal/share-through-email-modal___stuur-een-link-via-email'
				)}
			</BlockHeading>
			<p>
				{tHtml(
					'shared/components/share-through-email-modal/share-through-email-modal___wij-sturen-voor-jou-een-mailtje-met-deze-link'
				)}
			</p>
			<Spacer margin="top-large">
				<Box backgroundColor="gray" condensed>
					<Flex wrap justify="between">
						<FlexItem>
							<TextInput
								placeholder={tText(
									'shared/components/share-through-email-modal/share-through-email-modal___uw-e-mailadres'
								)}
								value={emailAddress}
								onChange={setEmailAddress}
							/>
						</FlexItem>
						<FlexItem shrink>
							<Spacer margin="left-small">
								<Button
									type="primary"
									onClick={sendEmail}
									disabled={isProcessing}
									label={
										isProcessing
											? tText(
													'shared/components/share-through-email-modal/share-through-email-modal___versturen'
											  )
											: tText(
													'shared/components/share-through-email-modal/share-through-email-modal___verzenden'
											  )
									}
								/>
							</Spacer>
						</FlexItem>
					</Flex>
				</Box>
			</Spacer>
		</>
	);
};

export default withUser(ShareThroughEmailContent) as FC<AddToCollectionModalProps>;
