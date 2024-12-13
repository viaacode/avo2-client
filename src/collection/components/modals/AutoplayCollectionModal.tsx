import { type FlowplayerSourceItem, type FlowplayerSourceList } from '@meemoo/react-components';
import { Flex, Modal, ModalBody, Spinner } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, useCallback, useEffect, useState } from 'react';

import { FlowPlayerWrapper } from '../../../shared/components';
import { isMobileWidth, toSeconds } from '../../../shared/helpers';
import { getValidStartAndEnd } from '../../../shared/helpers/cut-start-and-end';
import { getFlowPlayerPoster } from '../../../shared/helpers/get-poster';
import useTranslation from '../../../shared/hooks/useTranslation';
import { fetchPlayerTickets } from '../../../shared/services/player-ticket-service';

import './AutoplayCollectionModal.scss';

interface AutoplayCollectionModalProps {
	isOpen: boolean;
	onClose?: () => void;
	collectionFragments: Avo.Collection.Fragment[];
}

const AutoplayCollectionModal: FC<AutoplayCollectionModalProps> = ({
	isOpen,
	onClose,
	collectionFragments,
}) => {
	const { tHtml } = useTranslation();
	const [sourceList, setSourceList] = useState<FlowplayerSourceList | null>(null);

	const fetchPlayableUrls = useCallback(async () => {
		const playableFragments = collectionFragments.filter(
			(fragment) => !!(fragment.item_meta as Avo.Item.Item)?.external_id
		);
		const playableUrls = await fetchPlayerTickets(
			playableFragments.map((frag) => frag.external_id)
		);
		setSourceList({
			type: 'flowplayer/playlist',
			items: playableFragments.map((frag, fragIndex): FlowplayerSourceItem => {
				const itemMeta = frag.item_meta as Avo.Item.Item;
				const title =
					(frag.use_custom_fields ? frag.custom_title : frag.item_meta?.title) ||
					frag.item_meta?.title ||
					'';
				const [start, end] = getValidStartAndEnd(
					frag.start_oc,
					frag.end_oc,
					toSeconds((frag.item_meta as Avo.Item.Item).duration)
				);
				return {
					src: playableUrls[fragIndex],
					title,
					poster: getFlowPlayerPoster(frag.thumbnail_path, itemMeta) || '',
					category: 'video',
					provider: itemMeta?.organisation?.name || '',
					cuepoints: start && end ? [{ startTime: start, endTime: end }] : undefined,
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
		return <FlowPlayerWrapper src={sourceList} canPlay autoplay trackPlayEvent={true} />;
	};

	const handleClose = () => {
		setSourceList(null);
		onClose?.();
	};

	return (
		<Modal
			isOpen={isOpen}
			title={tHtml(
				'collection/components/modals/autoplay-collection-modal___speel-de-collectie-af'
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

export default AutoplayCollectionModal;
