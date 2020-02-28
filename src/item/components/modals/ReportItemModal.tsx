import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	FormGroup,
	Modal,
	ModalBody,
	ModalFooterRight,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	Spinner,
	TextArea,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { toastService } from '../../../shared/services';
import { ZendeskService } from '../../../shared/services/zendesk-service';
import i18n from '../../../shared/translations/i18n';
import { Tickets } from 'node-zendesk';

interface ReportItemModalProps {
	externalId: string;
	isOpen: boolean;
	onClose: () => void;
	user: Avo.User.User;
}

const RADIO_BUTTON_LABELS = {
	broken: i18n.t('Defect'),
	inappropriate: i18n.t('Ongepast '),
	copyright: i18n.t('Schending auteursrechten'),
};

const ReportItemModal: FunctionComponent<ReportItemModalProps> = ({
	externalId,
	isOpen,
	onClose,
	user,
}) => {
	const [t] = useTranslation();

	const [reason, setReason] = useState<keyof typeof RADIO_BUTTON_LABELS | null>(null);
	const [extraDetails, setExtraDetails] = useState<string>('');
	const [isProcessing, setISProcessing] = useState<boolean>(false);

	const reportItem = async () => {
		let ticket: Tickets.CreateModel | undefined;
		try {
			if (!reason) {
				return;
			}
			setISProcessing(true);
			const body = {
				extraDetails,
				firstName: get(user, 'first_name'),
				lastName: get(user, 'last_name'),
				email: get(user, 'mail'),
				reason: RADIO_BUTTON_LABELS[reason],
			};
			ticket = {
				comment: {
					url: window.location.href,
					body: JSON.stringify(body),
					html_body: `<dl>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___voornaam">Voornaam</Trans></dt><dd>${
		body.firstName
  }</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___achternaam">Achternaam</Trans></dt><dd>${
		body.lastName
  }</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___email">Email</Trans></dt><dd>${
		body.email
  }</dd>
  <dt><Trans>Reden van rapporteren</Trans></dt><dd>${RADIO_BUTTON_LABELS[reason]}</dd>
  <dt><Trans>Extra toelichting</Trans></dt><dd>${extraDetails ||
		t('Geen extra toelichting ingegeven')}</dd>
</dl>`,
					public: false,
				},
				subject: t('Media item gerapporteerd door gebruiker op AvO2'),
			};
			await ZendeskService.createTicket(ticket);
			onClose();
			toastService.success(t('Het item is gerapporteerd'));
		} catch (err) {
			console.error('Failed to create zendesk ticket for reporting an item', err, {
				ticket,
				externalId,
				user,
			});
			toastService.danger(
				t(
					'authentication/views/registration-flow/r-4-manual-registration___het-versturen-van-je-aanvraag-is-mislukt'
				)
			);
		}
		setISProcessing(false);
	};

	const renderReportItemModal = () => {
		return (
			<Modal
				title={t('Waarom wil je dit fragment rapporteren? ')}
				size="medium"
				isOpen={isOpen}
				onClose={onClose}
				scrollable
			>
				<ModalBody>
					<div>
						<Spacer>
							<FormGroup>
								<RadioButtonGroup>
									<RadioButton
										label={RADIO_BUTTON_LABELS['broken']}
										name="broken"
										value="broken"
										checked={reason === 'broken'}
										onChange={() => setReason('broken')}
									/>
									<RadioButton
										label={RADIO_BUTTON_LABELS['inappropriate']}
										name="inappropriate"
										value="inappropriate"
										checked={reason === 'inappropriate'}
										onChange={() => setReason('inappropriate')}
									/>
									<RadioButton
										label={RADIO_BUTTON_LABELS['copyright']}
										name="copyright"
										value="copyright"
										checked={reason === 'copyright'}
										onChange={() => setReason('copyright')}
									/>
								</RadioButtonGroup>
							</FormGroup>
							<Spacer margin="top-large">
								<FormGroup label={t('Geef eventueel meer toelichting')}>
									<TextArea
										width="large"
										rows={5}
										value={extraDetails}
										onChange={setExtraDetails}
									/>
								</FormGroup>
							</Spacer>
						</Spacer>
					</div>
				</ModalBody>
				<ModalFooterRight>
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<ButtonToolbar>
									{isProcessing && <Spinner />}
									<Button
										label={t(
											'item/components/modals/add-to-collection-modal___annuleren'
										)}
										type="link"
										block
										onClick={onClose}
										disabled={isProcessing}
									/>
									<Button
										label={t('Verzenden')}
										type="primary"
										block
										disabled={isProcessing || !reason}
										title={
											reason
												? ''
												: t(
														'Je moet een reden opgeven om een item te kunnen rapporteren'
												  )
										}
										onClick={reportItem}
									/>
								</ButtonToolbar>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</ModalFooterRight>
			</Modal>
		);
	};

	return renderReportItemModal();
};

export default ReportItemModal;
