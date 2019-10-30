import React, { FunctionComponent, useEffect, useState } from 'react';

import {
	Blankslate,
	Button,
	ButtonToolbar,
	Flex,
	Form,
	ImageGrid,
	Modal,
	ModalBody,
	ModalFooterRight,
	Spacer,
	Spinner,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getThumbnailsForCollection } from '../../../shared/services/stills-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { STILL_DIMENSIONS } from '../../constants';

interface CollectionStillsModalProps {
	isOpen: boolean;
	onClose: () => void;
	collection: Avo.Collection.Collection;
}

const CollectionStillsModal: FunctionComponent<CollectionStillsModalProps> = ({
	onClose,
	isOpen,
	collection,
}) => {
	const [videoStills, setVideoStills] = useState<string[]>();
	const [selectedCoverImages, setSelectedCoverImages] = useState<string[]>(
		collection.thumbnail_path ? [collection.thumbnail_path] : []
	);

	const fetchThumbnailImages = async () => {
		try {
			setVideoStills(await getThumbnailsForCollection(collection));
		} catch (err) {
			console.error(err);
			toastService('Het ophalen van de media thumbnails is mislukt.', TOAST_TYPE.DANGER);
			setVideoStills([]);
		}
	};

	const onCollectionUpdate = () => {
		if (!isOpen) {
			return;
		}

		fetchThumbnailImages();
	};

	useEffect(onCollectionUpdate, [isOpen, collection]);

	const saveCoverImage = () => {
		collection.thumbnail_path = selectedCoverImages[0];
		onClose();
		toastService('De cover afbeelding is ingesteld.', TOAST_TYPE.SUCCESS);
	};

	return (
		<Modal
			isOpen={isOpen}
			title="Stel een cover afbeelding in"
			size="large"
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				<Spacer>
					<Form>
						{!videoStills ? (
							<Flex center orientation="horizontal">
								<Spinner size="large" />
							</Flex>
						) : !videoStills.length ? (
							<Blankslate
								body=""
								icon="search"
								title="Er zijn geen thumbnails beschikbaar voor de fragmenten in de collectie"
							/>
						) : (
							<ImageGrid
								images={videoStills}
								allowSelect
								value={selectedCoverImages}
								onChange={setSelectedCoverImages}
								{...STILL_DIMENSIONS}
							/>
						)}
					</Form>
				</Spacer>
			</ModalBody>
			<ModalFooterRight>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button label="Annuleren" type="secondary" block onClick={onClose} />
								<Button label="Opslaan" type="primary" block onClick={saveCoverImage} />
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalFooterRight>
		</Modal>
	);
};

export default CollectionStillsModal;
