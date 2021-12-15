import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal, ModalBody } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { FlowPlayerWrapper } from '../../../shared/components';

import './AutoplayCollectionModal.scss';

interface AutoplayCollectionModalProps {
	isOpen: boolean;
	onClose?: () => void;
	collectionFragments: Avo.Collection.Fragment[];
	// TODO Bavo types
	history: any;
	location: any;
	match: any;
	user: Avo.User.User;
}

const AutoplayCollectionModal: FunctionComponent<AutoplayCollectionModalProps> = ({
	isOpen,
	onClose,
	collectionFragments,
	// history,
	// location,
	// match,
	// user,
}) => {
	const [t] = useTranslation();

	const [currentFragment, setCurrentFragment] = useState<number>(0);

	return (
		<Modal
			isOpen={isOpen}
			title={t(
				'collection/components/modals/autoplay-collection-modal___speel-de-collectie-af'
			)}
			size="large"
			onClose={onClose}
			className="c-content"
		>
			<ModalBody>
				<div className="c-modal__autoplay-grid">
					<ul className="c-modal__autoplay-queue u-spacer-right-l">
						{collectionFragments.map((fragment) => {
							return (
								<li onClick={() => setCurrentFragment(fragment.position)}>
									{fragment.item_meta?.title}
									<img
										src={
											fragment.item_meta?.thumbnail_path
												? fragment.item_meta.thumbnail_path
												: ''
										}
										alt=""
									/>
								</li>
							);
						})}
					</ul>
					<div className="c-modal__autoplay-video">
						<FlowPlayerWrapper
							item={collectionFragments[currentFragment].item_meta as Avo.Item.Item}
							canPlay={true}
							cuePoints={{
								start: collectionFragments[0].start_oc,
								end: collectionFragments[0].end_oc,
							}}
							external_id={
								(collectionFragments[0].item_meta as Avo.Item.Item).external_id
							}
							duration={(collectionFragments[0].item_meta as Avo.Item.Item).duration}
							title={collectionFragments[0].item_meta?.title}
						/>
					</div>
				</div>
			</ModalBody>
		</Modal>
	);
};

export default AutoplayCollectionModal;
