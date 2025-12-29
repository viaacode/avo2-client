import {
  Button,
  ButtonToolbar,
  Modal,
  ModalBody,
  ModalFooterRight,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components';
import { AvoCoreContentPickerType } from '@viaa/avo2-types';
import { noop } from 'es-toolkit';
import { type FC, useState } from 'react';
import { tHtml } from '../../../../shared/helpers/translate-html';
import { tText } from '../../../../shared/helpers/translate-text';
import { type PickerItem } from '../../types/content-picker';
import { ContentPicker } from '../ContentPicker/ContentPicker';

interface ChangeAuthorModalProps {
  initialAuthor?: PickerItem;
  isOpen: boolean;
  onClose?: () => void;
  callback: (authorProfileId: PickerItem) => void;
}

export const ChangeAuthorModal: FC<ChangeAuthorModalProps> = ({
  onClose = noop,
  isOpen,
  initialAuthor,
  callback,
}) => {
  const [author, setAuthor] = useState<PickerItem | undefined>(initialAuthor);

  const handleClose = () => {
    onClose();
    setAuthor(initialAuthor);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={tHtml(
        'admin/shared/components/change-author-modal/change-author-modal___selecteer-een-auteur',
      )}
      size="small"
      onClose={handleClose}
    >
      <ModalBody>
        <ContentPicker
          initialValue={author || undefined}
          hideTargetSwitch
          hideTypeDropdown
          placeholder={tText(
            'admin/shared/components/change-author-modal/change-author-modal___selecteer-een-auteur',
          )}
          allowedTypes={[AvoCoreContentPickerType.PROFILE]}
          onSelect={(newAuthor: PickerItem | null) => {
            setAuthor(newAuthor || undefined);
          }}
          key={author ? author.value : author}
        />
      </ModalBody>
      <ModalFooterRight>
        <Toolbar>
          <ToolbarRight>
            <ToolbarItem>
              <ButtonToolbar>
                <Button
                  type="secondary"
                  label={tText(
                    'admin/shared/components/change-author-modal/change-author-modal___annuleren',
                  )}
                  onClick={handleClose}
                />
                <Button
                  type="primary"
                  label={tText(
                    'admin/shared/components/change-author-modal/change-author-modal___toepassen',
                  )}
                  onClick={() => {
                    if (author) {
                      callback(author);
                    }
                    handleClose();
                  }}
                />
              </ButtonToolbar>
            </ToolbarItem>
          </ToolbarRight>
        </Toolbar>
      </ModalFooterRight>
    </Modal>
  );
};
