import { compact, uniq } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';

import {
	Blankslate,
	Button,
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

import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { isVideoFragment } from '../../helpers';
import { getVideoStills } from '../../service';

interface CollectionStillsModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	collection: Avo.Collection.Response;
}

const CollectionStillsModal: FunctionComponent<CollectionStillsModalProps> = ({
	setIsOpen,
	isOpen,
	collection,
}) => {
	const [videoStills, setVideoStills] = useState<string[] | null>(null);
	const [selectedCoverImages, setSelectedCoverImages] = useState(
		collection.thumbnail_path ? [collection.thumbnail_path] : []
	);

	useEffect(() => {
		const fetchThumbnailImages = async () => {
			// Only update thumbnails when modal is opened, not when closed
			try {
				const externalIds = compact(
					collection.collection_fragments.map(fragment =>
						isVideoFragment(fragment) ? fragment.external_id : undefined
					)
				);
				const videoStills: Avo.Stills.StillInfo[] = await getVideoStills(externalIds, 20);

				setVideoStills(
					uniq([
						...(collection.thumbnail_path ? [collection.thumbnail_path] : []),
						...videoStills.map(videoStill => videoStill.thumbnailImagePath),
					])
				);
			} catch (err) {
				toastService('Het ophalen van de video thumbnails is mislukt', TOAST_TYPE.DANGER);
				console.error(err);
			}
		};

		fetchThumbnailImages().then(() => {});
	}, [collection, isOpen]);

	const saveCoverImage = () => {
		collection.thumbnail_path = selectedCoverImages[0];
		setIsOpen(false);
		toastService('De cover afbeelding is ingesteld', TOAST_TYPE.SUCCESS);
	};

	return (
		<Modal
			isOpen={isOpen}
			title="Stel een cover afbeelding in"
			size="large"
			onClose={() => setIsOpen(!isOpen)}
			scrollable={true}
		>
			<ModalBody>
				<div className="u-spacer">
					<Form>
						{videoStills === null ? (
							<div className="o-flex o-flex--horizontal-center">
								<Spinner size="large" />
							</div>
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
								<Button
									label="Annuleren"
									type="secondary"
									block={true}
									onClick={() => setIsOpen(false)}
								/>
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
