import classNames from 'classnames';
import React, { FunctionComponent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Scrollbar from 'react-scrollbars-custom';

import { Button, Icon, Modal, ModalBody } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { FlowPlayerWrapper } from '../../../shared/components';
import { useElementSize } from '../../../shared/hooks';

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
	const [t] = useTranslation();

	const videoRef = useRef(null);
	const videoSize = useElementSize(videoRef);

	const [currentFragment, setCurrentFragment] = useState<number>(0);
	const [showPlayNext, setShowPlayNext] = useState<boolean>(false);
	const [autoPlay, setAutoPlay] = useState<boolean>(true);
	const timeout = useRef<NodeJS.Timeout | null>(null);
	// filter unplayable fragments
	const playableFragments = collectionFragments.filter((fragment) => !!fragment.item_meta);
	const frag = playableFragments[currentFragment];

	const playVideo = (index: number) => {
		cancelTimer();
		setShowPlayNext(false);
		setCurrentFragment(index);
		setAutoPlay(true);
	};

	const handleVideoEnded = () => {
		setAutoPlay(false);

		if (currentFragment + 1 < playableFragments.length) {
			setShowPlayNext(true);
			timeout.current = setTimeout(() => {
				playVideo(currentFragment + 1);
			}, 7000);
		}
	};

	const cancelTimer = () => {
		if (timeout.current) {
			clearTimeout(timeout.current);
		}
	};

	const cancelAutoPlay = () => {
		cancelTimer();
		setShowPlayNext(false);
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
		>
			<ModalBody>
				<div className="c-modal__autoplay-grid">
					<p className="c-modal__autoplay-queue-title">
						{t(
							'collection/components/modals/autoplay-collection-modal___volgende-in-de-afspeellijst'
						)}
					</p>

					<ul className="c-modal__autoplay-queue">
						<Scrollbar
							style={{
								maxHeight:
									window.innerWidth <= 900
										? '100%'
										: `${videoSize && videoSize?.height}px`,
							}}
						>
							{collectionFragments.map((fragment) => {
								return (
									<li
										key={fragment.id}
										className={classNames(
											'c-modal__autoplay-queue-item',
											fragment.position === currentFragment ? 'selected' : ''
										)}
										onClick={() => playVideo(fragment.position)}
									>
										{fragment.item_meta?.title}
										<img
											src={fragment.item_meta?.thumbnail_path || ''}
											alt=""
										/>
									</li>
								);
							})}
						</Scrollbar>
					</ul>

					<div className="c-modal__autoplay-video" ref={videoRef}>
						<FlowPlayerWrapper
							item={frag?.item_meta as Avo.Item.Item}
							canPlay={true}
							autoplay={isOpen && autoPlay}
							cuePoints={{
								start: frag?.start_oc,
								end: frag?.end_oc,
							}}
							external_id={(frag?.item_meta as Avo.Item.Item)?.external_id}
							duration={(frag?.item_meta as Avo.Item.Item)?.duration}
							title={frag?.item_meta?.title}
							onEnded={handleVideoEnded}
						/>
						{showPlayNext && (
							<div className="c-modal__autoplay-video-overlay">
								<p>
									{t(
										'collection/components/modals/autoplay-collection-modal___volgende-in-de-afspeellijst'
									)}
								</p>
								<div id="countdown" onClick={() => playVideo(currentFragment + 1)}>
									<div id="countdown-inner">
										<Icon name="skip-forward" size="huge" />
									</div>
									<svg className="animation">
										<circle r="38" cx="40" cy="40"></circle>
									</svg>
								</div>
								<p>{playableFragments[currentFragment + 1]?.item_meta?.title}</p>
								<Button
									onClick={cancelAutoPlay}
									size="large"
									title={t(
										'collection/components/modals/autoplay-collection-modal___annuleren'
									)}
									label={t(
										'collection/components/modals/autoplay-collection-modal___annuleren'
									)}
									ariaLabel={t(
										'collection/components/modals/autoplay-collection-modal___annuleren'
									)}
									type="underlined-link"
								/>
							</div>
						)}
					</div>
				</div>
			</ModalBody>
		</Modal>
	);
};

export default AutoplayCollectionModal;