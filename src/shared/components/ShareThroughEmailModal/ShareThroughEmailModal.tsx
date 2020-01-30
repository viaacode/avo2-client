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
	Spinner,
	TextInput,
} from '@viaa/avo2-components';

import toastService from '../../../shared/services/toast-service';
import { copyToClipboard } from '../../helpers';
import { shareThroughEmail } from '../../helpers/share-through-email';

import './ShareThroughEmailModal.scss';

interface AddToCollectionModalProps {
	title: string;
	type: 'item' | 'collection' | 'bundle';
	link: string;
	isOpen: boolean;
	onClose: () => void;
}

const ShareThroughEmailModal: FunctionComponent<AddToCollectionModalProps> = ({
	title,
	type,
	link,
	isOpen,
	onClose,
}) => {
	const [t] = useTranslation();

	const [emailAddress, setEmailAddress] = useState<string>('');
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const sendEmail = async () => {
		try {
			setIsProcessing(true);
			await shareThroughEmail(emailAddress, title, link, type);
			toastService.success(t('De email is verstuurd'));
		} catch (err) {
			console.error('Failed to send email to share item', err, {
				emailAddress,
				title,
				link,
				type,
			});
			toastService.danger('Het versturen van de email is mislukt');
		}
		setIsProcessing(false);
	};

	return (
		<Modal title={title} size="auto" isOpen={isOpen} onClose={onClose} scrollable>
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
				<Box backgroundColor="soft-white">
					<Flex wrap justify="between" align="baseline">
						<FlexItem>
							<a href={link}>{link}</a>
						</FlexItem>
						<FlexItem>
							<Button
								label={t('Kopieer link')}
								onClick={() => {
									copyToClipboard(link);
									toastService.success(t('De url is naar het klembord gekopieerd'));
								}}
							/>
						</FlexItem>
					</Flex>
				</Box>
				<BlockHeading type="h4">
					<Trans>Stuur een link via email</Trans>
				</BlockHeading>
				<p>
					<Trans>Wij sturen voor jou een mailtje met deze link.</Trans>
				</p>
				<Box backgroundColor="soft-white">
					<Flex wrap justify="between" align="baseline">
						<FlexItem>
							<TextInput
								placeholder={t('Uw e-mailadres...')}
								value={emailAddress}
								onChange={setEmailAddress}
							/>
						</FlexItem>
						<FlexItem>
							<Button type="primary" onClick={sendEmail}>
								{isProcessing ? <Spinner /> : t('Verzenden')}
							</Button>
						</FlexItem>
					</Flex>
				</Box>
			</ModalBody>
		</Modal>
	);
};

export default ShareThroughEmailModal;
