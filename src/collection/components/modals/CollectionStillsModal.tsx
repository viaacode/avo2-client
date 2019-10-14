import React, { FunctionComponent, useEffect, useState } from 'react';

import {
	Blankslate,
	Button,
	Flex,
	Form,
	ImageGrid,
	Modal,
	ModalBody,
	ModalFooterRight,
	Spinner,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { getThumbnailsForCollection } from '../../../shared/services/stills-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';

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
	const [videoStills, setVideoStills] = useState<string[] | null>(null);
	const [selectedCoverImages, setSelectedCoverImages] = useState<string[]>(
		collection.thumbnail_path ? [collection.thumbnail_path] : []
	);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const fetchThumbnailImages = async () => {
			// Only update thumbnails when modal is opened, not when closed
			try {
				setVideoStills(await getThumbnailsForCollection(collection));
			} catch (err) {
				toastService('Het ophalen van de video thumbnails is mislukt', TOAST_TYPE.DANGER);
				console.error(err);
				setVideoStills([]);
			}
		};

		fetchThumbnailImages().then(() => {});
	}, [collection, isOpen]);

	const saveCoverImage = () => {
		collection.thumbnail_path = selectedCoverImages[0];
		onClose();
		toastService('De cover afbeelding is ingesteld', TOAST_TYPE.SUCCESS);
	};

	return (
		<Modal
			isOpen={isOpen}
			title="Stel een cover afbeelding in"
			size="large"
			onClose={onClose}
			scrollable={true}
		>
			<ModalBody>
				<div className="u-spacer">
					<Form>
						{videoStills === null ? (
							<Flex center orientation="horizontal">
								<Spinner size="large" />
							</Flex>
						) : videoStills.length === 0 ? (
							<Blankslate
								body=""
								icon="search"
								title="Er zijn geen thumbnails beschikbaar voor de fragmenten in de collectie"
							/>
						) : (
							<ImageGrid
								images={videoStills}
								allowSelect={true}
								value={selectedCoverImages}
								onChange={setSelectedCoverImages}
								width={177}
								height={100}
							/>
						)}
					</Form>
				</div>
			</ModalBody>
			<ModalFooterRight>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<div className="c-button-toolbar">
								<Button label="Annuleren" type="secondary" block={true} onClick={onClose} />
								<Button
									label="Opslaan"
									type="primary"
									block={true}
									onClick={() => saveCoverImage()}
								/>
							</div>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalFooterRight>
		</Modal>
	);
};

export default CollectionStillsModal;
