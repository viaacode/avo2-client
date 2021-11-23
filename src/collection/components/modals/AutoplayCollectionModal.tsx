import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal, ModalBody } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { FragmentDetail } from '../../components';

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
	history,
	location,
	match,
	user,
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
			scrollable
			className="c-content"
		>
			<ModalBody>
				<ul>
					{collectionFragments.map((fragment) => {
						return (
							<li onClick={() => setCurrentFragment(fragment.position)}>
								{fragment.id}
							</li>
						);
					})}
				</ul>
				<FragmentDetail
					collectionFragment={collectionFragments[currentFragment]}
					showDescription={false}
					linkToItems={false}
					user={user}
					history={history}
					location={location}
					match={match}
				/>
			</ModalBody>
		</Modal>
	);
};

export default AutoplayCollectionModal;
