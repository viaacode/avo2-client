import {
  Button,
  ButtonToolbar,
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  Spacer,
  Toggle,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components';
import { noop } from 'es-toolkit';
import { type FC, type ReactNode, useState } from 'react';

import { tHtml } from '../../shared/helpers/translate-html';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose?: () => void;
  createAssignmentCallback: (withDescription: boolean) => void;
  translations: {
    title: string | ReactNode;
    primaryButton: string;
    secondaryButton: string;
  };
}

export const CreateAssignmentModal: FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  createAssignmentCallback,
  translations,
}) => {
  const [createWithDescription, setCreateWithDescription] =
    useState<boolean>(false);

  const handleCreateAssignment = () => {
    createAssignmentCallback(createWithDescription);
    (onClose || noop)();
  };

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
                onClick={handleCreateAssignment}
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
        {tHtml(
          'assignment/modals/create-assignment-modal___wil-je-de-beschrijving-van-de-fragmenten-mee-importeren',
        )}
        <Flex style={{ marginTop: '1.6rem' }}>
          <Toggle
            checked={createWithDescription}
            onChange={(checked) => setCreateWithDescription(checked)}
          />
          <Spacer margin="left">
            <FlexItem>Importeer fragmenten met beschrijving</FlexItem>
          </Spacer>
        </Flex>
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
