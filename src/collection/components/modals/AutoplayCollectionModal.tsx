import { FlowplayerSourceItem, FlowplayerSourceList } from '@meemoo/react-components';
import { Flex, Modal, ModalBody, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { FlowPlayerWrapper } from '../../../shared/components';
import { isMobileWidth, toSeconds } from '../../../shared/helpers';
import { getValidStartAndEnd } from '../../../shared/helpers/cut-start-and-end';
import useTranslation from '../../../shared/hooks/useTranslation';
import { fetchPlayerTickets } from '../../../shared/services/player-ticket-service';

import './AutoplayCollectionModal.scss';

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
	const { tText } = useTranslation();
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
			items: playableFragments.map((frag, fragIndex): FlowplayerSourceItem => {
				const title =
					(frag.use_custom_fields ? frag.custom_title : frag.item_meta?.title) ||
					frag.item_meta?.title ||
					'';
				const [start, end] = getValidStartAndEnd(
					frag.start_oc,
					frag.end_oc,
					toSeconds((frag.item_meta as ItemSchema).duration)
				);
				return {
					src: playableUrls[fragIndex],
					title,
					poster: frag.thumbnail_path || '',
					category: 'video',
					provider: frag.item_meta?.organisation?.name || '',
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
		return <FlowPlayerWrapper src={sourceList} canPlay autoplay />;
	};

	return (
		<Modal
			isOpen={isOpen}
			title={tText(
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
