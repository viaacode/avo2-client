import { RichTextEditorWithInternalState } from '@meemoo/react-components';
import {
  Button,
  Column,
  convertToHtml,
  Form,
  FormGroup,
  Grid,
  IconName,
  TextInput,
  Thumbnail,
  Toggle,
  Toolbar,
  ToolbarItem,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { isEqual, isNil, isString } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import React, {
  type FC,
  type ReactNode,
  type ReactText,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import { buildGlobalSearchLink } from '../../../assignment/helpers/build-search-link';
import { commonUserAtom } from '../../../authentication/authentication.store';
import { APP_PATH } from '../../../constants';
import { ItemMetadata } from '../../../shared/components/BlockItemMetadata/ItemMetadata';
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal';
import { FlowPlayerWrapper } from '../../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import { MoreOptionsDropdownWrapper } from '../../../shared/components/MoreOptionsDropdownWrapper/MoreOptionsDropdownWrapper';
import {
  RICH_TEXT_EDITOR_OPTIONS_AUTHOR,
  RICH_TEXT_EDITOR_OPTIONS_DEFAULT,
} from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import { getMoreOptionsLabel } from '../../../shared/constants';
import { buildLink } from '../../../shared/helpers/build-link';
import { createDropdownMenuItem } from '../../../shared/helpers/dropdown';
import { getFlowPlayerPoster } from '../../../shared/helpers/get-poster';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { QUERY_PARAM_SHOW_PUBLISH_MODAL } from '../../views/CollectionDetail.const';
import { type CollectionAction } from '../CollectionOrBundleEdit.types';
import { FRAGMENT_EDIT_DELAY } from '../CollectionOrBundleEditContent.consts';
import { CutFragmentModal } from '../modals/CutFragmentModal';

import { FragmentAdd } from './FragmentAdd';
import {
  COLLECTION_FRAGMENT_TYPE_TO_EVENT_OBJECT_TYPE,
  GET_FRAGMENT_DELETE_LABELS,
  GET_FRAGMENT_DELETE_SUCCESS_MESSAGES,
  GET_FRAGMENT_EDIT_SWITCH_LABELS,
  GET_FRAGMENT_PUBLISH_STATUS_LABELS,
} from './FragmentEdit.const';
import { FragmentEditAction } from './FragmentEdit.types';

import './FragmentEdit.scss';
import { tText } from '../../../shared/helpers/translate-text';

interface FragmentEditProps {
  index: number;
  collectionId: string;
  numberOfFragments: number;
  changeCollectionState: (action: CollectionAction) => void;
  openOptionsId: number | string | null;
  setOpenOptionsId: (id: number | string | null) => void;

  /**
   * true: parent is a collection
   * false: parent is a bundle
   */
  isParentACollection: boolean;
  fragment: Avo.Collection.Fragment;
  allowedToAddLinks: boolean;
  renderWarning?: () => ReactNode | null;
  onFocus?: () => void;
}

const FragmentEdit: FC<FragmentEditProps> = ({
  index,
  collectionId,
  numberOfFragments,
  changeCollectionState,
  openOptionsId,
  setOpenOptionsId,
  isParentACollection,
  fragment,
  allowedToAddLinks,
  renderWarning = () => null,
  onFocus,
}) => {
  const commonUser = useAtomValue(commonUserAtom);

  /**
   * https://meemoo.atlassian.net/browse/AVO-3370
   * Delay the save action by 50ms to ensure the  fragment properties are saved locally
   * We cannot update the fragment states live in the parent component, because that would also rerender the video players
   * and that would cause the video players to lose their current time setting
   */
  const [shouldSave, setShouldSave] = useState(false);

  /**
   * Save the properties of this fragment locally and only update the parent component state, if the user clicks outside the fragment edit component
   * https://meemoo.atlassian.net/browse/AVO-3370
   * Delay the save action by 100ms to ensure the fragment properties are saved
   * We cannot update the fragment states live in the parent component, because that would also rerender the video players
   * and that would cause the video players to lose their current time setting
   */
  const [useCustomFields, setUseCustomFields] = useState(
    fragment.use_custom_fields,
  );

  const getTitle = useCallback(() => {
    if (useCustomFields) {
      return fragment.custom_title || '';
    }
    return fragment.item_meta?.title || '';
  }, [useCustomFields, fragment.custom_title, fragment.item_meta]);

  const getDescription = (): string | undefined => {
    let description: string | undefined | null;
    if (useCustomFields) {
      description = fragment.custom_description;
    } else {
      description = fragment?.item_meta?.description;
    }
    if (isString(description)) {
      description = convertToHtml(description);
    }
    return description || undefined;
  };

  const [customTitle, setCustomTitle] = useState(getTitle());
  const [customDescription, setCustomDescription] = useState(getDescription());

  const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  // Check whether the current fragment is the first and/or last fragment in collection
  const isFirst = (fragmentIndex: number) => fragmentIndex === 0;
  const isLast = (fragmentIndex: number) =>
    fragmentIndex === numberOfFragments - 1;

  const FRAGMENT_DROPDOWN_ITEMS = [
    // TODO: DISABLED FEATURE
    // createDropdownMenuItem('duplicate', 'Dupliceren', 'copy'),
    // createDropdownMenuItem('move', 'Verplaatsen', 'arrow-right'),
    ...createDropdownMenuItem(
      String(fragment.id),
      FragmentEditAction.DETAIL,
      'Bekijk',
      IconName.externalLink,
      !isParentACollection, // Only show view button for bundles
    ),
    ...createDropdownMenuItem(
      String(fragment.id),
      FragmentEditAction.DELETE,
      'Verwijderen',
      undefined,
      true,
    ),
    // TODO: DISABLED FEATURE
    // createDropdownMenuItem('copyToCollection', 'Kopiëren naar andere collectie', 'copy'),
    // createDropdownMenuItem('moveToCollection', 'Verplaatsen naar andere collectie', 'arrow-right'),
  ];

  const submitStateToParent = useCallback(() => {
    changeCollectionState({
      index,
      fragmentProp: 'use_custom_fields',
      fragmentPropValue: useCustomFields,
      type: 'UPDATE_FRAGMENT_PROP',
    });
    changeCollectionState({
      index,
      fragmentProp: 'custom_title',
      fragmentPropValue: customTitle,
      type: 'UPDATE_FRAGMENT_PROP',
    });
    changeCollectionState({
      index,
      fragmentProp: 'custom_description',
      fragmentPropValue: customDescription,
      type: 'UPDATE_FRAGMENT_PROP',
    });
  }, [
    changeCollectionState,
    customDescription,
    customTitle,
    index,
    useCustomFields,
  ]);

  const handleClickEvent = (evt: MouseEvent) => {
    if ((evt.target as HTMLElement)?.closest('.c-fragment-edit__form')) {
      // https://meemoo.atlassian.net/browse/AVO-3370
      // https://meemoo.atlassian.net/browse/AVO-3573
      // User clicked inside the fragment edit component
      // Do not update the parent state
      // So the video playback will not be reset
      return;
    }
    // User clicked outside the fragment edit component
    // Update parent state => which will trigger a re-render of the fragment edit component
    // Which will reset the video playback
    setTimeout(() => {
      setShouldSave(true);
    }, FRAGMENT_EDIT_DELAY);
  };

  useEffect(() => {
    setShouldSave(true);
  }, [useCustomFields]);

  useEffect(() => {
    if (shouldSave) {
      submitStateToParent();
      setShouldSave(false);
    }
  }, [shouldSave, submitStateToParent]);

  useEffect(() => {
    window.addEventListener('click', handleClickEvent);
    return () => window.removeEventListener('click', handleClickEvent);
  }, []);

  const itemMetaData = (fragment as any).item_meta;

  const onDeleteFragment = () => {
    setDeleteModalOpen(false);
    setOpenOptionsId(null);

    changeCollectionState({
      index,
      type: 'DELETE_FRAGMENT',
    });

    const eventObjectType =
      COLLECTION_FRAGMENT_TYPE_TO_EVENT_OBJECT_TYPE[fragment.type];
    if (eventObjectType) {
      // We don't have to track the deletion of TEXT, ZOEK, BOUW blocks, only ITEM, COLLECTION, ASSIGNMENT
      trackEvents(
        {
          object: collectionId,
          object_type: eventObjectType,
          action: 'delete',
        },
        commonUser,
      );
    }

    ToastService.success(GET_FRAGMENT_DELETE_SUCCESS_MESSAGES()[fragment.type]);
  };

  // TODO: DISABLED FEATURE
  // const onDuplicateFragment = () => {
  // 	setOpenOptionsId(null);
  // 	ToastService.success(tHtml('collection/components/fragment/fragment-edit___fragment-is-succesvol-gedupliceerd'));
  // };

  // const onMoveFragment = () => {
  // 	setOpenOptionsId(null);
  // 	ToastService.success(tHtml('collection/components/fragment/fragment-edit___fragment-is-succesvol-verplaatst'));
  // };

  // const onCopyFragmentToCollection = () => {
  // 	setOpenOptionsId(null);
  // 	ToastService.success(tHtml('collection/components/fragment/fragment-edit___fragment-is-succesvol-gekopieerd-naar-collectie'));
  // };

  // const onMoveFragmentToCollection = () => {
  // 	setOpenOptionsId(null);
  // 	ToastService.success(tHtml('collection/components/fragment/fragment-edit___fragment-is-succesvol-verplaatst-naar-collectie'));
  // };

  const onClickDropdownItem = (item: ReactText) => {
    setOpenOptionsId(null);
    switch (item) {
      // TODO: DISABLED FEATURE
      // case 'duplicate':
      // 	onDuplicateFragment();
      // 	break;
      // case 'move':
      // 	onMoveFragment();
      // 	break;

      case FragmentEditAction.DETAIL: {
        const routeInfo =
          fragment.type === Avo.Core.BlockItemType.COLLECTION
            ? APP_PATH.COLLECTION_DETAIL
            : APP_PATH.ASSIGNMENT_DETAIL;
        window.open(
          buildLink(routeInfo.route, { id: fragment.external_id }),
          '_blank',
        );
        break;
      }

      case FragmentEditAction.DELETE:
        setDeleteModalOpen(true);
        break;

      // TODO: DISABLED FEATURE
      // case 'copyToCollection':
      // 	onCopyFragmentToCollection();
      // 	break;
      // case 'moveToCollection':
      // 	onMoveFragmentToCollection();
      // 	break;
      default:
        return null;
    }
  };

  // Render functions
  const renderReorderButton = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && isFirst(index)) {
      return null;
    }
    if (direction === 'down' && isLast(index)) {
      return null;
    }
    return (
      <Button
        type="secondary"
        icon={`chevron-${direction}` as IconName}
        ariaLabel={
          direction === 'up'
            ? tText(
                'collection/components/fragment/fragment-edit___verplaats-naar-boven',
              )
            : tText(
                'collection/components/fragment/fragment-edit___verplaats-naar-onder',
              )
        }
        title={
          direction === 'up'
            ? tText(
                'collection/components/fragment/fragment-edit___verplaats-naar-boven',
              )
            : tText(
                'collection/components/fragment/fragment-edit___verplaats-naar-onder',
              )
        }
        onClick={() => {
          changeCollectionState({
            index,
            direction,
            type: 'SWAP_FRAGMENTS',
          });
        }}
      />
    );
  };

  const renderForm = () => {
    const disableVideoFields: boolean =
      !useCustomFields && fragment.type !== Avo.Core.BlockItemType.TEXT;

    return (
      <Form className="c-fragment-edit__form">
        {itemMetaData && (
          <FormGroup
            label={GET_FRAGMENT_EDIT_SWITCH_LABELS()[fragment.type]}
            labelFor={`customFields___${fragment.id}`}
          >
            <Toggle
              id={`customFields___${fragment.id}`}
              checked={useCustomFields}
              onChange={(newUseCustomFields: boolean) =>
                setUseCustomFields(newUseCustomFields)
              }
            />
          </FormGroup>
        )}
        <FormGroup
          label={tText(
            'collection/components/fragment/fragment-edit___tekstblok-titel',
          )}
          labelFor={`title___${fragment.id}`}
        >
          <TextInput
            id={`title___${fragment.id}`}
            type="text"
            value={customTitle}
            placeholder={tText(
              'collection/components/fragment/fragment-edit___geef-hier-de-titel-van-je-tekstblok-in',
            )}
            onChange={setCustomTitle}
            disabled={disableVideoFields}
            onFocus={onFocus}
          />
        </FormGroup>
        {!!fragment.item_meta && isParentACollection && (
          <ItemMetadata
            item={fragment.item_meta as Avo.Item.Item}
            buildSeriesLink={(series) =>
              buildGlobalSearchLink({ filters: { serie: [series] } })
            }
          />
        )}
        {fragment.type !== 'COLLECTION' && fragment.type !== 'ASSIGNMENT' && (
          <FormGroup
            label={tText(
              'collection/components/fragment/fragment-edit___tekstblok-beschrijving',
            )}
            labelFor={`description___${fragment.id}`}
          >
            {!isNil(allowedToAddLinks) && (
              <RichTextEditorWithInternalState
                id={`description___${fragment.id}`}
                controls={
                  allowedToAddLinks
                    ? RICH_TEXT_EDITOR_OPTIONS_AUTHOR
                    : RICH_TEXT_EDITOR_OPTIONS_DEFAULT
                }
                placeholder={tText(
                  'collection/components/fragment/fragment-edit___geef-hier-de-inhoud-van-je-tekstblok-in',
                )}
                value={customDescription || undefined}
                onChange={(newDescription: string) => {
                  setCustomDescription(newDescription);
                }}
                disabled={disableVideoFields}
                onFocus={onFocus}
              />
            )}
          </FormGroup>
        )}
      </Form>
    );
  };

  const renderThumbnailOrVideo = () => {
    if (fragment.type === 'ITEM') {
      return (
        <FlowPlayerWrapper
          item={itemMetaData}
          poster={getFlowPlayerPoster(fragment.thumbnail_path, itemMetaData)}
          external_id={itemMetaData.external_id}
          duration={itemMetaData.duration}
          title={itemMetaData.title}
          cuePointsVideo={{
            start: fragment.start_oc,
            end: fragment.end_oc,
          }}
          cuePointsLabel={{
            start: fragment.start_oc,
            end: fragment.end_oc,
          }}
          canPlay={!isCutModalOpen && !isDeleteModalOpen}
          trackPlayEvent={false}
        />
      );
    }
    if (fragment.type === 'COLLECTION' || fragment.type === 'ASSIGNMENT') {
      return (
        <Thumbnail
          category={Avo.ContentType.English.COLLECTION}
          src={itemMetaData.thumbnail_path}
        />
      );
    }
  };

  const renderToolbar = () => {
    const fragmentIsPublished: boolean | undefined = (
      fragment.item_meta as
        | Avo.Collection.Collection
        | Avo.Assignment.Assignment
    )?.is_public;
    return (
      <Toolbar>
        <ToolbarLeft>
          <ToolbarItem>
            <div className="c-button-toolbar">
              {renderReorderButton(index, 'up')}
              {renderReorderButton(index, 'down')}
              {itemMetaData && fragment.type === 'ITEM' && (
                <Button
                  icon={IconName.scissors}
                  label={tText(
                    'collection/components/fragment/fragment-edit___knippen',
                  )}
                  title={tText(
                    'collection/components/fragment/fragment-edit___knip-een-fragment-uit-dit-video-audio-fragment',
                  )}
                  type="secondary"
                  onClick={() => setIsCutModalOpen(true)}
                />
              )}
            </div>
          </ToolbarItem>
        </ToolbarLeft>
        <ToolbarRight>
          {!isNil(fragmentIsPublished) && (
            <ToolbarItem>
              <Link
                to={buildLink(
                  fragment.type === 'COLLECTION'
                    ? APP_PATH.COLLECTION_DETAIL.route
                    : APP_PATH.ASSIGNMENT_DETAIL.route,
                  { id: fragment.external_id },
                  { [QUERY_PARAM_SHOW_PUBLISH_MODAL]: '1' },
                )}
              >
                <Button
                  type="secondary"
                  icon={fragmentIsPublished ? IconName.unlock3 : IconName.lock}
                  ariaLabel={
                    GET_FRAGMENT_PUBLISH_STATUS_LABELS()[fragment.type][
                      String(fragmentIsPublished)
                    ]
                  }
                  title={
                    GET_FRAGMENT_PUBLISH_STATUS_LABELS()[fragment.type][
                      String(fragmentIsPublished)
                    ]
                  }
                />
              </Link>
            </ToolbarItem>
          )}
          <ToolbarItem>
            <MoreOptionsDropdownWrapper
              isOpen={openOptionsId === fragment.id}
              onOpen={() => setOpenOptionsId(fragment.id)}
              onClose={() => setOpenOptionsId(null)}
              label={getMoreOptionsLabel()}
              menuItems={FRAGMENT_DROPDOWN_ITEMS}
              onOptionClicked={onClickDropdownItem}
            />
          </ToolbarItem>
        </ToolbarRight>
      </Toolbar>
    );
  };

  return (
    <div className="c-fragment-edit">
      <div className="c-panel">
        <div className="c-panel__header">{renderToolbar()}</div>
        {renderWarning()}
        <div className="c-panel__body">
          {fragment.type !== Avo.Core.BlockItemType.TEXT && itemMetaData ? (
            <Grid>
              <Column size="3-6">{renderThumbnailOrVideo()}</Column>
              <Column size="3-6">{renderForm()}</Column>
            </Grid>
          ) : (
            <Form>{renderForm()}</Form>
          )}
        </div>
      </div>

      {isParentACollection && (
        <FragmentAdd
          index={index}
          collectionId={collectionId}
          numberOfFragments={numberOfFragments}
          changeCollectionState={changeCollectionState}
        />
      )}

      <ConfirmModal
        title={GET_FRAGMENT_DELETE_LABELS()[fragment.type]}
        body={tText(
          'collection/components/fragment/fragment-edit___deze-actie-kan-niet-ongedaan-gemaakt-worden',
        )}
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        confirmCallback={() => onDeleteFragment()}
      />

      {itemMetaData &&
        fragment.type !== 'COLLECTION' &&
        fragment.type !== 'ASSIGNMENT' && (
          <CutFragmentModal
            isOpen={isCutModalOpen}
            onClose={() => setIsCutModalOpen(false)}
            itemMetaData={itemMetaData}
            changeCollectionState={changeCollectionState}
            fragment={fragment}
            index={index}
          />
        )}
    </div>
  );
};

function areEqual(prevProps: FragmentEditProps, nextProps: FragmentEditProps) {
  return (
    prevProps.numberOfFragments === nextProps.numberOfFragments &&
    prevProps.collectionId === nextProps.collectionId &&
    isEqual(prevProps.fragment, nextProps.fragment) &&
    isEqual(prevProps.openOptionsId, nextProps.openOptionsId) &&
    prevProps.allowedToAddLinks === nextProps.allowedToAddLinks &&
    prevProps.index === nextProps.index
  );
}

export default React.memo(FragmentEdit, areEqual);
