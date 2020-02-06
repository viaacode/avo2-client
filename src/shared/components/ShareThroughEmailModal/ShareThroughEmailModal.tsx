import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Box,
	Button,
	Flex,
	FlexItem,
	Modal,
	ModalBody,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';

import toastService from '../../../shared/services/toast-service';
import { copyToClipboard } from '../../helpers';
import { shareThroughEmail } from '../../helpers/share-through-email';

import { EmailTemplateType } from './share-through-email.types';
import './ShareThroughEmailModal.scss';

interface AddToCollectionModalProps {
	modalTitle: string;
	type: EmailTemplateType;
	emailLinkHref: string;
	emailLinkTitle: string;
	isOpen: boolean;
	onClose: () => void;
}

const ShareThroughEmailModal: FunctionComponent<AddToCollectionModalProps> = ({
	modalTitle,
	type,
	emailLinkHref,
	emailLinkTitle,
	isOpen,
	onClose,
}) => {
	const [t] = useTranslation();

	const [emailAddress, setEmailAddress] = useState<string>('');
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const copyLink = () => {
		copyToClipboard(emailLinkHref);
		toastService.success(t('De url is naar het klembord gekopieerd'));
	};

	const sendEmail = async () => {
		try {
			setIsProcessing(true);
			await shareThroughEmail(emailAddress, emailLinkTitle, emailLinkHref, type);
			toastService.success(t('De email is verstuurd'));
		} catch (err) {
			console.error('Failed to send email to share item', err, {
				emailAddress,
				emailLinkTitle,
				emailLinkHref,
				type,
			});
			toastService.danger('Het versturen van de email is mislukt');
		}
		setIsProcessing(false);
	};

	return (
		<Modal
			className="m-share-through-email-modal"
			title={modalTitle}
			size="medium"
			isOpen={isOpen}
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				<BlockHeading type="h4">
					<Trans>Kopieer deze publieke link</Trans>
				</BlockHeading>
				<p>
					<Trans>
						Let wel, enkel personen met een Archief voor Onderwijs account zullen deze link kunnen
						openen.
					</Trans>
				</p>
				<Spacer margin="top-large">
					<Box backgroundColor="gray" condensed>
						<Flex wrap justify="between" align="baseline">
							<FlexItem className="c-ellipsis">
								<a href={emailLinkHref}>{emailLinkHref}</a>
							</FlexItem>
							<FlexItem shrink>
								<Spacer margin="left-small">
									<Button label={t('Kopieer link')} onClick={copyLink} />
								</Spacer>
							</FlexItem>
						</Flex>
					</Box>
				</Spacer>
				<BlockHeading type="h4">
					<Trans>Stuur een link via email</Trans>
				</BlockHeading>
				<p>
					<Trans>Wij sturen voor jou een mailtje met deze link.</Trans>
				</p>
				<Spacer margin="top-large">
					<Box backgroundColor="gray" condensed>
						<Flex wrap justify="between">
							<FlexItem>
								<TextInput
									placeholder={t('Uw e-mailadres...')}
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
										label={isProcessing ? t('Versturen...') : t('Verzenden')}
									/>
								</Spacer>
							</FlexItem>
						</Flex>
					</Box>
				</Spacer>
			</ModalBody>
		</Modal>
	);
};

export default ShareThroughEmailModal;
