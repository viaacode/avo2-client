import {
  Button,
  ButtonToolbar,
  Modal,
  ModalBody,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components';
import { type FC, type ReactNode } from 'react';

interface ConfirmImportToAssignmentWithResponsesModalProps {
  isOpen: boolean;
  onClose?: () => void;
  confirmCallback: () => void;
  translations: {
    title: string | ReactNode;
    warningCallout: string;
    warningMessage: string;
    warningBody: string;
    primaryButton: string;
    secondaryButton: string;
  };
}

export const ConfirmImportToAssignmentWithResponsesModal: FC<
  ConfirmImportToAssignmentWithResponsesModalProps
> = ({ isOpen, onClose, confirmCallback, translations }) => {
  const renderConfirmButtons = () => {
    return (
      <Toolbar spaced>
        <ToolbarRight>
          <ToolbarItem>
            <ButtonToolbar>
              <Button
                type="secondary"
                label={translations.secondaryButton}
                onClick={onClose}
              />
              <Button
                type="primary"
                label={translations.primaryButton}
                onClick={confirmCallback}
              />
            </ButtonToolbar>
          </ToolbarItem>
        </ToolbarRight>
      </Toolbar>
    );
  };

  const renderModalBody = () => {
    return (
      <>
        <p>
          <strong>{translations.warningCallout}</strong>{' '}
          {translations.warningMessage}
        </p>
        <p>{translations.warningBody}</p>
        {renderConfirmButtons()}
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={translations.title}
      size="medium"
      onClose={onClose}
      scrollable
      className="c-content"
    >
      <ModalBody>{renderModalBody()}</ModalBody>
    </Modal>
  );
};
