import {
  Button,
  ButtonToolbar,
  Modal,
  ModalBody,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { noop, once } from 'es-toolkit';
import React, { type FC, useState } from 'react';

import { ItemVideoDescription } from '../../../item/components/ItemVideoDescription';
import { TimeCropControls } from '../../../shared/components/TimeCropControls/TimeCropControls';
import { DEFAULT_AUDIO_STILL } from '../../../shared/constants';
import { getValidStartAndEnd } from '../../../shared/helpers/cut-start-and-end';
import { isMobileWidth } from '../../../shared/helpers/media-query';
import { toSeconds } from '../../../shared/helpers/parsers/duration';
import { setModalVideoSeekTime } from '../../../shared/helpers/set-modal-video-seek-time';
import { ToastService } from '../../../shared/services/toast-service';
import { VideoStillService } from '../../../shared/services/video-stills-service';
import { getValidationErrorsForStartAndEnd } from '../../collection.helpers';
import { ContentTypeNumber } from '../../collection.types';
import { type CollectionAction } from '../CollectionOrBundleEdit.types';

import './CutFragmentModal.scss';
import { tText } from '../../../shared/helpers/translate-text';

export interface CutFragmentModalProps {
  isOpen: boolean;
  itemMetaData: Avo.Item.Item;
  index: number;
  fragment: Pick<
    Avo.Collection.Fragment,
    'start_oc' | 'end_oc' | 'item_meta' | 'thumbnail_path' | 'external_id'
  >;
  changeCollectionState: (action: CollectionAction) => void;
  onClose: () => void;
  onConfirm?: (
    update: Pick<Avo.Collection.Fragment, 'start_oc' | 'end_oc'>,
  ) => void;
}

export const CutFragmentModal: FC<CutFragmentModalProps> = ({
  isOpen,
  itemMetaData,
  index,
  fragment,
  changeCollectionState = noop,
  onClose,
  onConfirm,
}) => {
  // Save initial state for reusability purposes
  const [start, end] = getValidStartAndEnd(
    fragment.start_oc,
    fragment.end_oc,
    toSeconds(itemMetaData.duration),
  );

  const [fragmentStartTime, setFragmentStartTime] = useState<number>(
    start || 0,
  );
  const [fragmentEndTime, setFragmentEndTime] = useState<number>(
    end || toSeconds(itemMetaData.duration) || 0,
  );

  const getValidationErrors = (): string[] => {
    return getValidationErrorsForStartAndEnd({
      ...fragment,
      start_oc: fragmentStartTime,
      end_oc: fragmentEndTime,
    });
  };

  const onSaveCut = async () => {
    const errors = getValidationErrors();

    if (errors && errors.length) {
      ToastService.danger(errors);

      return;
    }

    const hasNoCut =
      fragmentStartTime === 0 && fragmentEndTime === fragmentDuration;

    changeCollectionState({
      index,
      type: 'UPDATE_FRAGMENT_PROP',
      fragmentProp: 'start_oc',
      fragmentPropValue: hasNoCut ? null : fragmentStartTime,
    });

    changeCollectionState({
      index,
      type: 'UPDATE_FRAGMENT_PROP',
      fragmentProp: 'end_oc',
      fragmentPropValue: hasNoCut ? null : fragmentEndTime,
    });

    try {
      if (fragment.item_meta?.type_id) {
        let videoStill: string | null;
        if (hasNoCut) {
          if (fragment.item_meta.type_id === ContentTypeNumber.audio) {
            videoStill = DEFAULT_AUDIO_STILL;
          } else {
            videoStill = fragment.item_meta.thumbnail_path;
          }
        } else {
          videoStill = await VideoStillService.getVideoStill(
            fragment.external_id,
            fragment.item_meta.type_id,
            (fragmentStartTime || 0) * 1000,
          );
        }

        if (videoStill) {
          changeCollectionState({
            index,
            type: 'UPDATE_FRAGMENT_PROP',
            fragmentProp: 'thumbnail_path',
            fragmentPropValue: videoStill,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to update video still.', error);
    }

    changeCollectionState({
      index,
      type: 'UPDATE_FRAGMENT_PROP',
      fragmentProp: 'start_oc',
      fragmentPropValue: fragmentStartTime,
    });

    changeCollectionState({
      index,
      type: 'UPDATE_FRAGMENT_PROP',
      fragmentProp: 'end_oc',
      fragmentPropValue: fragmentEndTime,
    });

    onConfirm &&
      onConfirm({
        start_oc: hasNoCut ? null : fragmentStartTime,
        end_oc: hasNoCut ? null : fragmentEndTime,
      });

    onClose();
  };

  const onCancelCut = () => {
    // Reset to default state
    setFragmentStartTime(start || 0);
    setFragmentEndTime(end || toSeconds(itemMetaData.duration) || 0);

    // Close modal
    onClose();
  };

  const startStartTimeOnce = once(() => {
    setModalVideoSeekTime(fragmentStartTime);
  });

  const fragmentDuration: number = toSeconds(itemMetaData.duration, true) || 0;
  return (
    <Modal
      isOpen={isOpen}
      title={tText(
        'collection/components/modals/cut-fragment-modal___knip-fragment',
      )}
      size="large"
      onClose={onClose}
      scrollable
      className="m-cut-fragment-modal"
    >
      <ModalBody>
        <ItemVideoDescription
          itemMetaData={itemMetaData}
          showMetadata={false}
          enableMetadataLink={false}
          showTitle
          showDescription={false}
          canPlay={isOpen}
          cuePointsLabel={{
            start: fragmentStartTime,
            end: fragmentEndTime,
          }}
          verticalLayout={isMobileWidth()}
          onPlay={startStartTimeOnce}
          trackPlayEvent={false}
        />
        <TimeCropControls
          className="u-spacer-top-l u-spacer-bottom-l"
          startTime={fragmentStartTime}
          endTime={fragmentEndTime}
          minTime={0}
          maxTime={fragmentDuration}
          onChange={(newStartTime: number, newEndTime: number) => {
            if (newStartTime !== fragmentStartTime) {
              setModalVideoSeekTime(newStartTime);
            } else if (newEndTime !== fragmentEndTime) {
              setModalVideoSeekTime(newEndTime);
            }
            setFragmentStartTime(newStartTime);
            setFragmentEndTime(newEndTime);
          }}
        />
        <Toolbar spaced>
          <ToolbarRight>
            <ToolbarItem>
              <ButtonToolbar>
                <Button
                  type="secondary"
                  label={tText(
                    'collection/components/modals/cut-fragment-modal___annuleren',
                  )}
                  onClick={onCancelCut}
                />
                <Button
                  type="primary"
                  label={tText(
                    'collection/components/modals/cut-fragment-modal___knippen',
                  )}
                  onClick={onSaveCut}
                />
              </ButtonToolbar>
            </ToolbarItem>
          </ToolbarRight>
        </Toolbar>
      </ModalBody>
    </Modal>
  );
};
