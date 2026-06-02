import { type RichEditorState } from '@meemoo/react-components';
import {
  Button,
  ButtonToolbar,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooterRight,
  Select,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components';
import { AvoCoreContentPickerType, AvoItemItem } from '@viaa/avo2-types';
import { noop } from 'es-toolkit';
import { type FC, useState } from 'react';
import { RichTextEditorWrapper } from '../../../../shared/components/RichTextEditorWrapper/RichTextEditorWrapper';
import { CustomError } from '../../../../shared/helpers/custom-error';
import { stripHtml } from '../../../../shared/helpers/formatters/strip-html';
import { tHtml } from '../../../../shared/helpers/translate-html';
import { tText } from '../../../../shared/helpers/translate-text';
import { ToastService } from '../../../../shared/services/toast-service';
import { ContentPicker } from '../../../shared/components/ContentPicker/ContentPicker';
import { ItemsService } from '../../items.service';
import './DepublishItemModal.scss';
import { DepublishType } from '../../items.types.ts';

interface DepublishItemModalProps {
  item: AvoItemItem;
  isOpen: boolean;
  onClose?: () => void;
}

export const DepublishItemModal: FC<DepublishItemModalProps> = ({
  item,
  onClose = noop,
  isOpen,
}) => {
  const [depublishType, setDepublishType] = useState<DepublishType>(
    DepublishType.DEPUBLISH,
  );
  const [reason, setReason] = useState<RichEditorState | null>(null);
  const [replacementExternalId, setReplacementExternalId] = useState<
    string | null
  >(null);

  const handleClose = () => {
    setDepublishType(DepublishType.DEPUBLISH);
    setReason(null);
    setReplacementExternalId(null);
    onClose();
  };

  const depublishItem = async () => {
    try {
      const reasonHtml = reason ? reason.toHTML() : '';
      if (
        depublishType === DepublishType.DEPUBLISH_WITH_REASON &&
        (!reasonHtml || !stripHtml(reasonHtml).trim())
      ) {
        ToastService.danger(
          tHtml(
            'admin/items/components/depublish-item-modal/depublish-item-modal___reden-mag-niet-leeg-zijn',
          ),
        );
        return;
      }
      if (
        depublishType === DepublishType.DEPUBLISH_WITH_REPLACEMENT &&
        !replacementExternalId
      ) {
        ToastService.danger(
          tHtml(
            'admin/items/components/depublish-item-modal/depublish-item-modal___je-moet-een-vervang-item-selecteren',
          ),
        );
        return;
      }

      await ItemsService.depublishItem(
        item,
        depublishType,
        reasonHtml,
        replacementExternalId,
      );
      ToastService.success(
        tHtml(
          'admin/items/components/depublish-item-modal/depublish-item-modal___het-item-is-gedepubliceerd',
        ),
      );
      handleClose();
    } catch (err) {
      console.error(
        new CustomError('Failed to depublish item', err, {
          item,
          depublishType,
          reason,
          replacementExternalId,
        }),
      );
      ToastService.danger(
        tHtml(
          'admin/items/components/depublish-item-modal/depublish-item-modal___het-depubliceren-is-mislukt',
        ),
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={tHtml(
        'admin/items/components/depublish-item-modal/depublish-item-modal___item-depubliceren',
      )}
      size="medium"
      onClose={handleClose}
      className="m-depublish-modal"
    >
      <ModalBody>
        <Form>
          <FormGroup
            label={tText(
              'admin/items/components/depublish-item-modal/depublish-item-modal___hoe-depubliceren',
            )}
          >
            <Select
              options={[
                {
                  label: tText(
                    'admin/items/components/depublish-item-modal/depublish-item-modal___enkel-depubliceren',
                  ),
                  value: 'depublish',
                },
                {
                  label: tText(
                    'admin/items/components/depublish-item-modal/depublish-item-modal___depubliceren-met-reden',
                  ),
                  value: 'depublish_with_reason',
                },
                {
                  label: tText(
                    'admin/items/components/depublish-item-modal/depublish-item-modal___depubliceren-en-vervang-item-aanduiden',
                  ),
                  value: 'depublish_with_replacement',
                },
              ]}
              value={depublishType}
              onChange={setDepublishType as (value: string) => void}
            />
          </FormGroup>
          {depublishType === 'depublish_with_reason' && (
            <FormGroup
              label={tText(
                'admin/items/components/depublish-item-modal/depublish-item-modal___reden-tot-depubliceren',
              )}
            >
              <RichTextEditorWrapper
                placeholder={tText(
                  'admin/items/components/depublish-item-modal/depublish-item-modal___geef-een-reden-waarom-dit-item-gedepubliceerd-wordt',
                )}
                state={reason || undefined}
                onChange={setReason}
              />
            </FormGroup>
          )}
          {depublishType === 'depublish_with_replacement' && (
            <FormGroup
              label={tText(
                'admin/items/components/depublish-item-modal/depublish-item-modal___selecteer-item-ter-vervanging',
              )}
            >
              <ContentPicker
                initialValue={
                  replacementExternalId
                    ? {
                        type: AvoCoreContentPickerType.ITEM,
                        value: replacementExternalId,
                      }
                    : undefined
                }
                onSelect={(pickerItem) =>
                  setReplacementExternalId(pickerItem?.value || null)
                }
                hideTypeDropdown
                hideTargetSwitch
                allowedTypes={[AvoCoreContentPickerType.ITEM]}
              />
            </FormGroup>
          )}
        </Form>
      </ModalBody>
      <ModalFooterRight>
        <Toolbar>
          <ToolbarRight>
            <ToolbarItem>
              <ButtonToolbar>
                <Button
                  type="secondary"
                  label={tText(
                    'admin/shared/components/change-labels-modal/change-labels-modal___annuleren',
                  )}
                  onClick={handleClose}
                />
                <Button
                  type="primary"
                  label={tText(
                    'admin/items/components/depublish-item-modal/depublish-item-modal___depubliceer',
                  )}
                  onClick={depublishItem}
                />
              </ButtonToolbar>
            </ToolbarItem>
          </ToolbarRight>
        </Toolbar>
      </ModalFooterRight>
    </Modal>
  );
};
