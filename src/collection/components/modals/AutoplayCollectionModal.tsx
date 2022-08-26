import { Flex, Modal, ModalBody, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FlowPlayerWrapper } from '../../../shared/components';
import { FlowplayerSourceList } from '../../../shared/components/FlowPlayerWrapper/FlowPlayer';
import { fetchPlayerTickets } from '../../../shared/services/player-ticket-service';

import './AutoplayCollectionModal.scss';
import { isMobileWidth } from '../../../shared/helpers';

interface AutoplayCollectionModalProps {
	isOpen: boolean;
	onClose?: () => void;
	collectionFragments: Avo.Collection.Fragment[];
}

const AutoplayCollectionModal: FunctionComponent<AutoplayCollectionModalProps> = ({
	isOpen,
	onClose,
	collectionFragments,
}) => {
	const [t] = useTranslation();

	// const videoRef = useRef(null);
	// const videoSize = useElementSize(videoRef);
	//
	// const [currentFragment, setCurrentFragment] = useState<number>(0);
	// const [showPlayNext, setShowPlayNext] = useState<boolean>(false);
	// const [autoPlay, setAutoPlay] = useState<boolean>(true);
	// const timeout = useRef<NodeJS.Timeout | null>(null);
	// filter unplayable fragments

	// const frag = playableFragments[currentFragment];
	const [sourceList, setSourceList] = useState<FlowplayerSourceList | null>(null);

	const fetchPlayableUrls = useCallback(async () => {
		const playableFragments = collectionFragments.filter(
			(fragment) => !!fragment.item_meta?.external_id
		);
		const playableUrls = await fetchPlayerTickets(
			playableFragments.map((frag) => frag.external_id)
		);
		setSourceList({
			type: 'flowplayer/playlist',
			items: playableFragments.map((frag, fragIndex): FlowplayerSourceList['items'][0] => {
				const title =
					(frag.use_custom_fields ? frag.custom_title : frag.item_meta?.title) ||
					frag.item_meta?.title ||
					'';
				return {
					src: playableUrls[fragIndex],
					title,
					poster: frag.thumbnail_path || '',
					category: 'video',
					provider: frag.item_meta?.organisation?.name || '',
				};
			}),
		});
	}, [collectionFragments]);

	useEffect(() => {
		fetchPlayableUrls();
	}, [fetchPlayableUrls]);

	// const playVideo = (index: number) => {
	// 	cancelTimer();
	// 	setShowPlayNext(false);
	// 	setCurrentFragment(index);
	// 	setAutoPlay(true);
	// };

	// const handleVideoEnded = () => {
	// 	setAutoPlay(false);
	//
	// 	if (currentFragment + 1 < playableFragments.length) {
	// 		setShowPlayNext(true);
	// 		timeout.current = setTimeout(() => {
	// 			playVideo(currentFragment + 1);
	// 		}, 7000);
	// 	}
	// };

	// const cancelTimer = () => {
	// 	if (timeout.current) {
	// 		clearTimeout(timeout.current);
	// 	}
	// };

	// const cancelAutoPlay = () => {
	// 	cancelTimer();
	// 	setShowPlayNext(false);
	// };

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
				canPlay={true}
				autoplay={isOpen}
				// cuePoints={{
				// 	start: frag?.start_oc,
				// 	end: frag?.end_oc,
				// }}
				// external_id={(frag?.item_meta as Avo.Item.Item)?.external_id}
				// duration={(frag?.item_meta as Avo.Item.Item)?.duration}
				// title={frag?.item_meta?.title}
				// onEnded={handleVideoEnded}
			/>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t(
				'collection/components/modals/autoplay-collection-modal___speel-de-collectie-af'
			)}
			size="extra-large"
			onClose={onClose}
			className="c-modal__autoplay-modal"
			scrollable={isMobileWidth()}
		>
			<ModalBody>{isOpen && renderPlaylist()}</ModalBody>
		</Modal>
	);
};

export default AutoplayCollectionModal;
