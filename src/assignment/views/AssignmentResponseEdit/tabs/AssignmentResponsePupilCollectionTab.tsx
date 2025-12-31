import './AssignmentResponsePupilCollectionTab.scss';

import {
  Button,
  ButtonToolbar,
  Container,
  Flex,
  FormGroup,
  IconName,
  MoreOptionsDropdown,
  TextInput,
  Toolbar,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components';
import {
  AvoAssignmentBlock,
  AvoAssignmentResponse,
  AvoCoreBlockItemBase,
  AvoCoreBlockItemType,
} from '@viaa/avo2-types';
import { type Dispatch, type FC, type SetStateAction, useState } from 'react';
import PupilSvg from '../../../../assets/images/leerling.svg?react';
import { BlockList } from '../../../../shared/components/BlockList/BlockList';
import { EmptyStateMessage } from '../../../../shared/components/EmptyStateMessage/EmptyStateMessage';
import { getMoreOptionsLabel } from '../../../../shared/constants';
import { isMobileWidth } from '../../../../shared/helpers/media-query';
import { tHtml } from '../../../../shared/helpers/translate-html';
import { tText } from '../../../../shared/helpers/translate-text';
import { useBlocksList } from '../../../../shared/hooks/use-blocks-list';
import { useDraggableListModal } from '../../../../shared/hooks/use-draggable-list-modal';
import { ToastService } from '../../../../shared/services/toast-service';
import { UrlUpdateType } from '../../../../shared/types/use-query-params.ts';
import {
  ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
  NEW_ASSIGNMENT_BLOCK_ID_PREFIX,
} from '../../../assignment.const';
import { setBlockPositionToIndex } from '../../../assignment.helper';
import {
  type PupilCollectionFragment,
  type PupilSearchFilterState,
} from '../../../assignment.types';
import { AssignmentBlockItemDescriptionType } from '../../../components/AssignmentBlockDescriptionButtons';
import { buildAssignmentSearchLink } from '../../../helpers/build-search-link';
import { insertMultipleAtPosition } from '../../../helpers/insert-at-position';
import { useAssignmentBlockChangeHandler } from '../../../hooks/assignment-block-change-handler';
import { useBlockListModals } from '../../../hooks/assignment-content-modals';
import { useEditBlocks } from '../../../hooks/use-edit-blocks';

enum MobileActionId {
  reorderBlocks = 'reorderBlocks',
  viewAsTeacher = 'viewAsTeacher',
}

interface AssignmentResponsePupilCollectionTabProps {
  pastDeadline: boolean;
  assignmentResponse: AvoAssignmentResponse;
  setAssignmentResponse: Dispatch<SetStateAction<AvoAssignmentResponse>>;
  collectionTitle: string;
  setCollectionTitle: (newTitle: string) => void;
  pupilCollectionBlocks: PupilCollectionFragment[];
  setPupilCollectionBlocks: (
    newPupilCollectionBlocks: PupilCollectionFragment[],
  ) => void;
  formErrors: Record<string, string>;
  onShowPreviewClicked: () => void;
  setTab: (tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void;
  setFilterState: (
    state: PupilSearchFilterState,
    urlPushType?: UrlUpdateType,
  ) => void;
}

export const AssignmentResponsePupilCollectionTab: FC<
  AssignmentResponsePupilCollectionTabProps
> = ({
  pastDeadline,
  assignmentResponse,
  setAssignmentResponse,
  collectionTitle,
  setCollectionTitle,
  pupilCollectionBlocks,
  setPupilCollectionBlocks,
  formErrors,
  onShowPreviewClicked,
  setTab,
  setFilterState,
}) => {
  const [isMobileOptionsMenuOpen, setIsMobileOptionsMenuOpen] =
    useState<boolean>(false);
  const [isDraggableListModalOpen, setIsDraggableListModalOpen] =
    useState<boolean>(false);

  const updateBlocksInAssignmentResponseState = (
    newBlocks: AvoCoreBlockItemBase[],
  ) => {
    setAssignmentResponse(
      (prev: AvoAssignmentResponse) =>
        ({
          ...prev,
          pupil_collection_blocks: newBlocks as PupilCollectionFragment[],
        }) as any,
    ); // TODO remove cast once pupil_collection_blocks is in typings repo
    setPupilCollectionBlocks(newBlocks as PupilCollectionFragment[]);
  };

  // UI

  const [draggableListButton, draggableListModal] = useDraggableListModal({
    modal: {
      items: assignmentResponse.pupil_collection_blocks,
      isOpen: isDraggableListModalOpen,
      onClose: (reorderedBlocks?: PupilCollectionFragment[]) => {
        setIsDraggableListModalOpen(false);
        if (reorderedBlocks) {
          const blocks = setBlockPositionToIndex(
            reorderedBlocks,
          ) as AvoAssignmentBlock[];

          updateBlocksInAssignmentResponseState(blocks);
        }
      },
    },
    setIsOpen: setIsDraggableListModalOpen,
  });

  // Effects

  // Events
  const [renderedModals, confirmSliceModal] = useBlockListModals(
    assignmentResponse?.pupil_collection_blocks || [],
    updateBlocksInAssignmentResponseState,
    true,
    {
      confirmSliceConfig: {
        responses: [],
      },
    },
  );
  const setBlock = useAssignmentBlockChangeHandler(
    assignmentResponse?.pupil_collection_blocks || [],
    updateBlocksInAssignmentResponseState,
  );
  const renderBlockContent = useEditBlocks(
    setBlock,
    buildAssignmentSearchLink(setFilterState),
    [
      AssignmentBlockItemDescriptionType.original,
      AssignmentBlockItemDescriptionType.custom,
    ],
  );
  const [renderedListSorter] = useBlocksList(
    // TODO rename to useEditBlockList and switch to component instead of hook
    assignmentResponse.pupil_collection_blocks || [],
    updateBlocksInAssignmentResponseState,
    {
      listSorter: {
        content: (item: AvoCoreBlockItemBase | undefined) =>
          item && renderBlockContent(item),
        divider: (position: number) => (
          <Button
            icon={IconName.plus}
            type="secondary"
            onClick={() => {
              const newBlocks = insertMultipleAtPosition(
                assignmentResponse.pupil_collection_blocks || [],
                {
                  id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
                  assignment_response_id: assignmentResponse.id,
                  type: AvoCoreBlockItemType.TEXT,
                  position,
                  use_custom_fields: false,
                  custom_title: '',
                  custom_description: '',
                  start_oc: null,
                  end_oc: null,
                  thumbnail_path: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                } as PupilCollectionFragment,
              );

              updateBlocksInAssignmentResponseState(
                newBlocks as AvoCoreBlockItemBase[],
              );
            }}
          />
        ),
      },
      listSorterItem: {
        onSlice: (item) => {
          confirmSliceModal.setEntity(item);
          confirmSliceModal.setOpen(true);
        },
      },
    },
  );

  const executeMobileButtonAction = (action: MobileActionId) => {
    switch (action) {
      case MobileActionId.reorderBlocks:
        setIsDraggableListModalOpen(true);
        break;

      case MobileActionId.viewAsTeacher:
        onShowPreviewClicked();
        break;

      default:
        ToastService.danger(
          tHtml(
            'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___knop-actie-niet-gekend',
          ),
        );
    }
  };

  // Render

  const renderActionButtons = () => {
    if (isMobileWidth()) {
      return (
        <MoreOptionsDropdown
          isOpen={isMobileOptionsMenuOpen}
          onOpen={() => setIsMobileOptionsMenuOpen(true)}
          onClose={() => setIsMobileOptionsMenuOpen(false)}
          label={getMoreOptionsLabel()}
          menuItems={[
            {
              label: tText(
                'collection/components/collection-or-bundle-edit___herorden-fragmenten',
              ),
              id: MobileActionId.reorderBlocks,
            },
            {
              label: tText(
                'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___bekijk-als-lesgever',
              ),
              id: MobileActionId.viewAsTeacher,
            },
          ]}
          onOptionClicked={(action) =>
            executeMobileButtonAction(action as MobileActionId)
          }
        />
      );
    }
    return (
      <ButtonToolbar>
        {!!assignmentResponse?.pupil_collection_blocks?.length &&
          draggableListButton}
        <Button
          type="primary"
          label={tText(
            'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___bekijk-als-lesgever',
          )}
          onClick={onShowPreviewClicked}
        />
      </ButtonToolbar>
    );
  };

  const renderPupilCollectionBlocks = () => {
    return (
      <>
        <Container mode="vertical">
          <Toolbar alignTop className="c-toolbar--no-height u-spacer-bottom-l">
            <ToolbarLeft>
              <FormGroup
                label={tText(
                  'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___naam-resultatenset',
                )}
                className="c-form-group--full-width"
              >
                <Flex
                  className="u-spacer-top-s u-spacer-bottom-s"
                  orientation="vertical"
                >
                  <TextInput
                    type="text"
                    value={collectionTitle || ''}
                    onChange={(newTitle: string) => {
                      setAssignmentResponse((prev) => {
                        return {
                          ...prev,
                          collection_title: newTitle,
                        };
                      });
                      setCollectionTitle(newTitle);
                    }}
                  />
                </Flex>

                {formErrors.collection_title && (
                  <span className="c-floating-error">
                    {tText(
                      'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___een-titel-is-verplicht',
                    )}
                  </span>
                )}
              </FormGroup>
            </ToolbarLeft>
            <ToolbarRight>{renderActionButtons()}</ToolbarRight>
          </Toolbar>

          {renderedListSorter}

          {!assignmentResponse?.pupil_collection_blocks?.length && (
            <EmptyStateMessage
              img={<PupilSvg />}
              title={tText(
                'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___mijn-collectie-is-nog-leeg',
              )}
              message={
                <>
                  {tText(
                    'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___ga-naar',
                  )}{' '}
                  <Button
                    type="inline-link"
                    label={tText(
                      'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___zoeken',
                    )}
                    onClick={() =>
                      setTab(ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH)
                    }
                  />{' '}
                  {tText(
                    'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___om-fragmenten-toe-te-voegen-of-druk-op-de-plus-knop-hierboven-als-je-tekstblokken-wil-aanmaken',
                  )}{' '}
                  <a href="/hulp" target="_blank">
                    {tText(
                      'assignment/views/assignment-response-edit/tabs/assignment-response-pupil-collection-tab___hier',
                    )}
                  </a>
                  {'.'}
                </>
              }
            />
          )}
        </Container>
      </>
    );
  };

  const renderReadOnlyPupilCollectionBlocks = () => {
    return (
      <Container mode="vertical">
        <BlockList
          blocks={(pupilCollectionBlocks || []) as AvoCoreBlockItemBase[]}
        />
      </Container>
    );
  };

  return (
    <Container mode="horizontal">
      {pastDeadline
        ? renderReadOnlyPupilCollectionBlocks()
        : renderPupilCollectionBlocks()}
      {renderedModals}
      {draggableListModal}
    </Container>
  );
};
