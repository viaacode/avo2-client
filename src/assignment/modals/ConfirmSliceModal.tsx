import {
  Button,
  ButtonToolbar,
  Modal,
  ModalBody,
  type ModalProps,
  Spacer,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components';
import {
  AvoAssignmentBlock,
  AvoAssignmentResponse,
  AvoCoreBlockItemType,
} from '@viaa/avo2-types';
import { type FC } from 'react';
import { BLOCK_ITEM_LABELS } from '../../shared/components/BlockList/BlockList.consts';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';

export interface ConfirmSliceModalProps
  extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  responses?: AvoAssignmentResponse[];
  block?: Pick<AvoAssignmentBlock, 'type'>;
  isPupilCollection: boolean;
  onConfirm?: () => void;
}

export const ConfirmSliceModal: FC<ConfirmSliceModalProps> = ({
  responses = [],
  block,
  isPupilCollection,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const label = {
    type: block
      ? BLOCK_ITEM_LABELS(isPupilCollection)[block.type as AvoCoreBlockItemType]
      : '',
  };

  const renderConfirmButtons = () => {
    return (
      <Toolbar spaced>
        <ToolbarRight>
          <ToolbarItem>
            <ButtonToolbar>
              <Button
                type="secondary"
                label={tText('assignment/modals/confirm-slice___annuleer')}
                onClick={onClose}
              />
              <Button
                type="danger"
                label={tText('assignment/modals/confirm-slice___verwijder')}
                onClick={onConfirm}
              />
            </ButtonToolbar>
          </ToolbarItem>
        </ToolbarRight>
      </Toolbar>
    );
  };

  const renderModalBody = () => {
    switch (block?.type) {
      case AvoCoreBlockItemType.ITEM:
        return tHtml(
          'assignment/modals/confirm-slice___ben-je-zeker-dat-je-dit-fragment-wil-verwijderen',
        );
      case AvoCoreBlockItemType.TEXT:
        return isPupilCollection
          ? tHtml(
              'assignment/modals/confirm-slice-modal___ben-je-zeker-dat-je-dit-tekstblok-wil-verwijderen',
            )
          : tHtml(
              'assignment/modals/confirm-slice___ben-je-zeker-dat-je-dit-instructie-of-tekstblok-wil-verwijderen',
            );
      case AvoCoreBlockItemType.ZOEK:
      case AvoCoreBlockItemType.BOUW:
        return responses.length > 0 ? (
          <>
            <b>{tHtml('assignment/modals/confirm-slice___opgelet')}: </b>
            {tHtml(
              'assignment/modals/confirm-slice___opgelet-er-bestaan-reeds-leerlingencollecties-voor-deze-zoekopdracht-ben-je-zeker-dat-je-de-zoekoefening-en-leerlingencollecties-wil-verwijderen',
            )}
          </>
        ) : (
          tText(
            'assignment/modals/confirm-slice___ben-je-zeker-dat-je-de-zoekoefening-wil-verwijderen',
          )
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={tHtml('assignment/modals/confirm-slice___type-verwijderen', label)}
      size="medium"
      onClose={onClose}
      scrollable
      className="c-content"
    >
      <ModalBody>
        <Spacer margin={['bottom']}>{renderModalBody()}</Spacer>
        {renderConfirmButtons()}
      </ModalBody>
    </Modal>
  );
};
