import {
  type FlowplayerSourceItem,
  type FlowplayerSourceList,
} from '@meemoo/react-components';
import { Flex, Modal, ModalBody, Spinner } from '@viaa/avo2-components';

import { type FC, useCallback, useEffect, useState } from 'react';

import { FlowPlayerWrapper } from '../../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import { getValidStartAndEnd } from '../../../shared/helpers/cut-start-and-end';
import { getFlowPlayerPoster } from '../../../shared/helpers/get-poster';
import { isMobileWidth } from '../../../shared/helpers/media-query';
import { toSeconds } from '../../../shared/helpers/parsers/duration';
import { tHtml } from '../../../shared/helpers/translate-html';
import { fetchPlayerTickets } from '../../../shared/services/player-ticket-service';

import './AutoplayCollectionModal.scss';
import {
  AvoCollectionFragment,
  AvoContentTypeEnglish,
  AvoItemItem,
} from '@viaa/avo2-types';

interface AutoplayCollectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  collectionFragments: AvoCollectionFragment[];
}

export const AutoplayCollectionModal: FC<AutoplayCollectionModalProps> = ({
  isOpen,
  onClose,
  collectionFragments,
}) => {
  const [sourceList, setSourceList] = useState<FlowplayerSourceList | null>(
    null,
  );

  const fetchPlayableUrls = useCallback(async () => {
    const playableFragments = collectionFragments.filter(
      (fragment) => !!(fragment.item_meta as AvoItemItem)?.external_id,
    );
    const playableUrls = await fetchPlayerTickets(
      playableFragments.map((frag) => frag.external_id),
    );
    setSourceList({
      type: 'flowplayer/playlist',
      items: playableFragments.map((frag, fragIndex): FlowplayerSourceItem => {
        const itemMeta = frag.item_meta as AvoItemItem;
        const title =
          (frag.use_custom_fields
            ? frag.custom_title
            : frag.item_meta?.title) ||
          frag.item_meta?.title ||
          '';
        const [start, end] = getValidStartAndEnd(
          frag.start_oc,
          frag.end_oc,
          toSeconds((frag.item_meta as AvoItemItem).duration),
        );
        return {
          src: playableUrls[fragIndex],
          title,
          poster: getFlowPlayerPoster(frag.thumbnail_path, itemMeta) || '',
          category: AvoContentTypeEnglish.VIDEO,
          provider: itemMeta?.organisation?.name || '',
          cuepoints:
            start && end ? [{ startTime: start, endTime: end }] : undefined,
        };
      }),
    });
  }, [collectionFragments]);

  useEffect(() => {
    if (isOpen && !sourceList) {
      fetchPlayableUrls();
    }
  }, [fetchPlayableUrls, isOpen]);

  const renderPlaylist = () => {
    if (!sourceList) {
      return (
        <Flex orientation="horizontal" center>
          <Spinner size="large" />
        </Flex>
      );
    }
    return (
      <FlowPlayerWrapper
        src={sourceList}
        canPlay
        autoplay
        trackPlayEvent={true}
      />
    );
  };

  const handleClose = () => {
    setSourceList(null);
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={tHtml(
        'collection/components/modals/autoplay-collection-modal___speel-de-collectie-af',
      )}
      size="extra-large"
      onClose={handleClose}
      className="c-modal__autoplay-modal"
      scrollable={isMobileWidth()}
    >
      <ModalBody>{isOpen && renderPlaylist()}</ModalBody>
    </Modal>
  );
};
