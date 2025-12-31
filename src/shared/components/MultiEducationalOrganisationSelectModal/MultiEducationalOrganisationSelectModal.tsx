import {
  Button,
  Checkbox,
  Icon,
  IconName,
  Modal,
  ModalBody,
  ModalFooterRight,
  Spacer,
  TagList,
} from '@viaa/avo2-components';

import { clsx } from 'clsx';
import { type FC, type MouseEvent, useEffect, useState } from 'react';

import { NULL_FILTER } from '../../../admin/shared/helpers/filters';
import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';
import { EducationalOrganisationsSelect } from '../EducationalOrganisationsSelect/EducationalOrganisationsSelect';

import './MultiEducationalOrganisationSelectModal.scss';
import { AvoEducationOrganizationOrganization } from '@viaa/avo2-types';

interface MultiEducationalOrganisationSelectModalProps {
  label: string;
  id: string;
  values: AvoEducationOrganizationOrganization[];
  disabled?: boolean;
  onChange: (organisations: string[], id: string) => void;
  showSelectedValuesOnCollapsed?: boolean;
}

export const MultiEducationalOrganisationSelectModal: FC<
  MultiEducationalOrganisationSelectModalProps
> = ({
  label,
  id,
  values,
  disabled,
  onChange,
  showSelectedValuesOnCollapsed = true,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [includeEmpty, setIncludeEmpty] = useState<boolean>(false);
  const [selectedOrganisations, setSelectedOrganisations] =
    useState<AvoEducationOrganizationOrganization[]>(values);

  useEffect(() => {
    setSelectedOrganisations(
      values.filter((org) => org.organisationLabel !== NULL_FILTER),
    );
    setIncludeEmpty(
      !!values.find((org) => org.organisationLabel === NULL_FILTER),
    );
  }, [isOpen, values]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const applyFilter = () => {
    onChange(
      [
        ...selectedOrganisations.map(
          (org) => `${org.organisationId}:${org.unitId || ''}`,
        ),
        ...(includeEmpty ? [NULL_FILTER] : []),
      ],
      id,
    );
    closeModal();
  };

  const deleteAllSelectedOrganisations = (
    _tagId: string | number,
    clickEvent: MouseEvent,
  ) => {
    setSelectedOrganisations([]);
    onChange([], id);
    clickEvent.stopPropagation();
  };

  const renderCheckboxControl = () => {
    const selected: number =
      selectedOrganisations.length + (includeEmpty ? 1 : 0);
    return (
      <>
        <div>
          <Button
            autoHeight
            className="c-checkbox-dropdown-modal__trigger"
            type="secondary"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="c-button__content">
              <div className="c-button__label">{label}</div>
              {!!selected && showSelectedValuesOnCollapsed && (
                <TagList
                  tags={[
                    {
                      id: 'users',
                      label: `${selected} ${
                        selected > 1
                          ? tText(
                              'shared/components/multi-educational-organisation-select-modal/multi-educational-organisation-select-modal___items-geselecteerd',
                            )
                          : tText(
                              'shared/components/multi-educational-organisation-select-modal/multi-educational-organisation-select-modal___item-geselecteerd',
                            )
                      }`,
                    },
                  ]}
                  swatches={false}
                  closable
                  onTagClosed={deleteAllSelectedOrganisations}
                />
              )}
              <Icon
                className="c-button__icon"
                name={isOpen ? IconName.caretUp : IconName.caretDown}
                size="small"
                type="arrows"
              />
            </div>
          </Button>
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={tHtml(
            'shared/components/multi-educational-organisation-select-modal/multi-educational-organisation-select-modal___educatieve-organisaties',
          )}
          size={'medium'}
        >
          <ModalBody>
            <Spacer margin="bottom-small">
              <Checkbox
                label={tText('admin/users/user___leeg')}
                checked={includeEmpty}
                onChange={setIncludeEmpty}
              />
            </Spacer>
            <EducationalOrganisationsSelect
              organisations={selectedOrganisations}
              onChange={setSelectedOrganisations}
            />
          </ModalBody>
          <ModalFooterRight>
            <Button
              label={tText(
                'shared/components/checkbox-dropdown-modal/checkbox-dropdown-modal___toepassen',
              )}
              type="primary"
              className="c-apply-filter-button"
              block
              onClick={applyFilter}
            />
          </ModalFooterRight>
        </Modal>
      </>
    );
  };

  if (disabled) {
    return (
      <div className={clsx({ 'u-opacity-50 u-disable-click': disabled })}>
        {renderCheckboxControl()}
      </div>
    );
  }

  return renderCheckboxControl();
};
