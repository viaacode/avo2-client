import {
  Button,
  ButtonToolbar,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooterRight,
  RadioButtonGroup,
  Spacer,
  Spinner,
  TextArea,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import type { Requests } from 'node-zendesk';
import React, { type FC, useState } from 'react';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { getFullNameCommonUser } from '../../../shared/helpers/formatters/avatar';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { ZendeskService } from '../../../shared/services/zendesk-service';

interface ReportItemModalProps {
  externalId: string;
  isOpen: boolean;
  onClose: () => void;
}

type Reason = 'broken' | 'inappropriate' | 'copyright';

const GET_RADIO_BUTTON_LABELS = () => ({
  broken: tText('item/components/modals/report-item-modal___defect'),
  inappropriate: tText('item/components/modals/report-item-modal___ongepast'),
  copyright: tText(
    'item/components/modals/report-item-modal___schending-auteursrechten',
  ),
});

export const ReportItemModal: FC<ReportItemModalProps> = ({
  externalId,
  isOpen,
  onClose,
}) => {
  const commonUser = useAtomValue(commonUserAtom);

  const [reason, setReason] = useState<Reason | null>(null);
  const [extraDetails, setExtraDetails] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const reportItem = async () => {
    let ticket: Requests.CreateModel | undefined;
    try {
      if (!reason) {
        return;
      }
      setIsProcessing(true);
      const body = {
        extraDetails,
        reason: GET_RADIO_BUTTON_LABELS()[reason],
        pageUrl: window.location.href,
      };
      ticket = {
        comment: {
          url: window.location.href,
          body: JSON.stringify(body),
          html_body: `<dl>
  <dt>${tText('item/components/modals/report-item-modal___reden-van-rapporteren')}</dt><dd>${
    GET_RADIO_BUTTON_LABELS()[reason]
  }</dd>
  <dt>${tText('item/components/modals/report-item-modal___extra-toelichting')}</dt><dd>${
    extraDetails ||
    tText(
      'item/components/modals/report-item-modal___geen-extra-toelichting-ingegeven',
    )
  }</dd>
  <dt>${tText('item/components/modals/report-item-modal___pagina-url')}</dt><dd>${
    window.location.href
  }</dd>
</dl>`,
          public: false,
        },
        subject: tText(
          'item/components/modals/report-item-modal___media-item-gerapporteerd-door-gebruiker-op-av-o-2',
        ),
        requester: {
          email: commonUser?.email,
          name: getFullNameCommonUser(commonUser, true, false) || '',
        },
      };
      await ZendeskService.createTicket(ticket as Requests.CreateModel);

      trackEvents(
        {
          object: externalId,
          object_type: 'item',
          action: 'report',
        },
        commonUser,
      );

      onClose();
      ToastService.success(
        tHtml(
          'item/components/modals/report-item-modal___het-item-is-gerapporteerd',
        ),
      );
    } catch (err) {
      console.error(
        'Failed to create zendesk ticket for reporting an item',
        err,
        {
          ticket,
          externalId,
          commonUser,
        },
      );
      ToastService.danger(
        tHtml(
          'authentication/views/registration-flow/r-4-manual-registration___het-versturen-van-je-aanvraag-is-mislukt',
        ),
      );
    }
    setIsProcessing(false);
  };

  const renderReportItemModal = () => {
    return (
      <Modal
        title={tHtml(
          'item/components/modals/report-item-modal___waarom-wil-je-dit-fragment-rapporteren',
        )}
        size="medium"
        isOpen={isOpen}
        onClose={onClose}
        scrollable
      >
        <ModalBody>
          <div>
            <Spacer>
              <FormGroup
                label={tText(
                  'item/components/modals/report-item-modal___reden',
                )}
                required
              >
                <RadioButtonGroup
                  options={[
                    {
                      label: GET_RADIO_BUTTON_LABELS()['broken'],
                      value: 'broken',
                    },
                    {
                      label: GET_RADIO_BUTTON_LABELS()['inappropriate'],
                      value: 'inappropriate',
                    },
                    {
                      label: GET_RADIO_BUTTON_LABELS()['copyright'],
                      value: 'copyright',
                    },
                  ]}
                  value={reason}
                  onChange={(reason: string) => setReason(reason as Reason)}
                />
              </FormGroup>
              <Spacer margin="top-large">
                <FormGroup
                  label={tText(
                    'item/components/modals/report-item-modal___geef-eventueel-meer-toelichting',
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
                    label={tText(
                      'item/components/modals/add-to-collection-modal___annuleren',
                    )}
                    type="link"
                    block
                    onClick={onClose}
                    disabled={isProcessing}
                  />
                  <Button
                    label={tText(
                      'item/components/modals/report-item-modal___verzenden',
                    )}
                    type="primary"
                    block
                    disabled={isProcessing || !reason}
                    title={
                      reason
                        ? ''
                        : tText(
                            'item/components/modals/report-item-modal___je-moet-een-reden-opgeven-om-een-item-te-kunnen-rapporteren',
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
