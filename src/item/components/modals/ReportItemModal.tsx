import { get } from 'lodash-es';
import { Tickets } from 'node-zendesk';
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

import { ToastService, ZendeskService } from '../../../shared/services';
import i18n from '../../../shared/translations/i18n';

interface ReportItemModalProps {
	externalId: string;
	isOpen: boolean;
	onClose: () => void;
	user: Avo.User.User;
}

type Reason = 'broken' | 'inappropriate' | 'copyright';

const GET_RADIO_BUTTON_LABELS = () => ({
	broken: i18n.t('item/components/modals/report-item-modal___defect'),
	inappropriate: i18n.t('item/components/modals/report-item-modal___ongepast'),
	copyright: i18n.t('item/components/modals/report-item-modal___schending-auteursrechten'),
});

const ReportItemModal: FunctionComponent<ReportItemModalProps> = ({
	externalId,
	isOpen,
	onClose,
	user,
}) => {
	const [t] = useTranslation();

	const [reason, setReason] = useState<Reason | null>(null);
	const [extraDetails, setExtraDetails] = useState<string>('');
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const reportItem = async () => {
		let ticket: Tickets.CreateModel | undefined;
		try {
			if (!reason) {
				return;
			}
			setIsProcessing(true);
			const body = {
				extraDetails,
				firstName: get(user, 'first_name'),
				lastName: get(user, 'last_name'),
				email: get(user, 'mail'),
				reason: GET_RADIO_BUTTON_LABELS()[reason],
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
  <dt><Trans i18nKey="item/components/modals/report-item-modal___reden-van-rapporteren">Reden van rapporteren</Trans></dt><dd>${
		GET_RADIO_BUTTON_LABELS()[reason]
  }</dd>
  <dt><Trans i18nKey="item/components/modals/report-item-modal___extra-toelichting">Extra toelichting</Trans></dt><dd>${extraDetails ||
		t('item/components/modals/report-item-modal___geen-extra-toelichting-ingegeven')}</dd>
</dl>`,
					public: false,
				},
				subject: t(
					'item/components/modals/report-item-modal___media-item-gerapporteerd-door-gebruiker-op-av-o-2'
				),
			};
			await ZendeskService.createTicket(ticket);
			onClose();
			ToastService.success(
				t('item/components/modals/report-item-modal___het-item-is-gerapporteerd')
			);
		} catch (err) {
			console.error('Failed to create zendesk ticket for reporting an item', err, {
				ticket,
				externalId,
				user,
			});
			ToastService.danger(
				t(
					'authentication/views/registration-flow/r-4-manual-registration___het-versturen-van-je-aanvraag-is-mislukt'
				)
			);
		}
		setIsProcessing(false);
	};

	const renderReportItemModal = () => {
		return (
			<Modal
				title={t(
					'item/components/modals/report-item-modal___waarom-wil-je-dit-fragment-rapporteren'
				)}
				size="medium"
				isOpen={isOpen}
				onClose={onClose}
				scrollable
			>
				<ModalBody>
					<div>
						<Spacer>
							<FormGroup label={t('Reden')} required>
								<RadioButtonGroup>
									<RadioButton
										label={GET_RADIO_BUTTON_LABELS()['broken']}
										name="broken"
										value="broken"
										checked={reason === 'broken'}
										onChange={() => setReason('broken')}
									/>
									<RadioButton
										label={GET_RADIO_BUTTON_LABELS()['inappropriate']}
										name="inappropriate"
										value="inappropriate"
										checked={reason === 'inappropriate'}
										onChange={() => setReason('inappropriate')}
									/>
									<RadioButton
										label={GET_RADIO_BUTTON_LABELS()['copyright']}
										name="copyright"
										value="copyright"
										checked={reason === 'copyright'}
										onChange={() => setReason('copyright')}
									/>
								</RadioButtonGroup>
							</FormGroup>
							<Spacer margin="top-large">
								<FormGroup
									label={t(
										'item/components/modals/report-item-modal___geef-eventueel-meer-toelichting'
									)}
								>
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
										label={t(
											'item/components/modals/report-item-modal___verzenden'
										)}
										type="primary"
										block
										disabled={isProcessing || !reason}
										title={
											reason
												? ''
												: t(
														'item/components/modals/report-item-modal___je-moet-een-reden-opgeven-om-een-item-te-kunnen-rapporteren'
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
