import {
  Alert,
  Button,
  ButtonToolbar,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooterRight,
  Select,
  type SelectOption,
  Spacer,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components';
import { AvoAssignmentAssignment } from '@viaa/avo2-types';
import { type FC, useEffect, useMemo, useState } from 'react';
import { tHtml } from '../../../helpers/translate-html';
import { tText } from '../../../helpers/translate-text';
import { findRightByValue } from '../ShareWithColleagues.helpers';
import { ContributorInfoRight } from '../ShareWithColleagues.types';

type EditShareUserRightsModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: (right: ContributorInfoRight) => void;
  toEditContributorRight: ContributorInfoRight;
  options: SelectOption<ContributorInfoRight>[];
  assignment?: Partial<AvoAssignmentAssignment>;
};

export const EditShareUserRightsModal: FC<EditShareUserRightsModalProps> = ({
  isOpen,
  handleClose,
  handleConfirm,
  toEditContributorRight,
  options,
  assignment,
}) => {
  const [right, setRight] = useState<ContributorInfoRight>(
    toEditContributorRight,
  );

  useEffect(() => {
    if (isOpen) {
      setRight(toEditContributorRight);
    }
  }, [toEditContributorRight, isOpen]);

  const handleOnConfirm = () => {
    if (right) {
      handleConfirm(findRightByValue(right));
    }
  };

  /**
   * Boolean indicating whether the permission is being changed from viewer to contributor
   */
  const isEditToContributor = useMemo(
    () =>
      toEditContributorRight === ContributorInfoRight.VIEWER &&
      right === ContributorInfoRight.CONTRIBUTOR,
    [toEditContributorRight, right],
  );

  return (
    <Modal
      isOpen={isOpen}
      title={tHtml(
        'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___rol-van-gebruiker-aanpassen',
      )}
      size="small"
      onClose={handleClose}
    >
      <ModalBody>
        <Form>
          <FormGroup
            label={tText(
              'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___rol-van-gebruiker',
            )}
          >
            <Select
              className="c-rights-select"
              options={options}
              value={right}
              onChange={(value) => setRight(value as ContributorInfoRight)}
            />
          </FormGroup>
        </Form>

        {assignment && isEditToContributor && (
          <Spacer margin={['top']}>
            <Alert>
              {tHtml(
                'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___als-je-deze-collega-aanpast-naar-bewerker-krijgen-zij-ook-toegang-tot-de-resultaten-van-je-leerlingen-ben-je-zeker',
              )}
            </Alert>
          </Spacer>
        )}
      </ModalBody>
      <ModalFooterRight>
        <Toolbar>
          <ToolbarRight>
            <ToolbarItem>
              <ButtonToolbar>
                <Button
                  type="secondary"
                  label={tText(
                    'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___annuleer',
                  )}
                  onClick={handleClose}
                />

                <Button
                  type="primary"
                  label={tText(
                    'shared/components/share-with-colleagues/modals/edit-share-user-rights-modal___bevestigen',
                  )}
                  onClick={handleOnConfirm}
                />
              </ButtonToolbar>
            </ToolbarItem>
          </ToolbarRight>
        </Toolbar>
      </ModalFooterRight>
    </Modal>
  );
};
