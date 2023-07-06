import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Button,
	ButtonToolbar,
	FormGroup,
	Modal,
	ModalBody,
	RadioButtonGroup,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import useTranslation from '../../../shared/hooks/useTranslation';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { getValidationErrorsForPublish } from '../../collection.helpers';
import { CollectionService } from '../../collection.service';

interface PublishCollectionModalProps extends DefaultSecureRouteProps {
	isOpen: boolean;
	onClose: (collection?: Avo.Collection.Collection) => void;
	collection: Avo.Collection.Collection;
}

const PublishCollectionModal: FunctionComponent<PublishCollectionModalProps> = ({
	onClose,
	isOpen,
	collection,
	user,
}) => {
	const { tText, tHtml } = useTranslation();

	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [isCollectionPublic, setIsCollectionPublic] = useState(collection.is_public);

	const isCollection = () => {
		return collection.type_id === 3;
	};

	useEffect(() => {
		setIsCollectionPublic(collection.is_public);
	}, [isOpen, setIsCollectionPublic, collection.is_public]);

	const onSave = async () => {
		try {
			const isPublished = isCollectionPublic && !collection.is_public;
			const isDepublished = !isCollectionPublic && collection.is_public;

			// Close modal when isPublic doesn't change
			if (!isPublished && !isDepublished) {
				onClose();
				return;
			}

			// Validate if user wants to publish
			if (isPublished) {
				const validationErrors: string[] = await getValidationErrorsForPublish(collection);

				if (validationErrors && validationErrors.length) {
					setValidationError(validationErrors);
					ToastService.danger(validationErrors);
					return;
				}
			}

			const newCollectionProps: Partial<Avo.Collection.Collection> = {
				is_public: isCollectionPublic,
				published_at: new Date().toISOString(),
			};
			await CollectionService.updateCollectionProperties(collection.id, newCollectionProps);
			setValidationError(undefined);
			ToastService.success(
				isCollection()
					? isCollectionPublic
						? tHtml(
								'collection/components/modals/share-collection-modal___de-collectie-staat-nu-publiek'
						  )
						: tHtml(
								'collection/components/modals/share-collection-modal___de-collectie-staat-nu-niet-meer-publiek'
						  )
					: isCollectionPublic
					? tHtml(
							'collection/components/modals/share-collection-modal___de-bundel-staat-nu-publiek'
					  )
					: tHtml(
							'collection/components/modals/share-collection-modal___de-bundel-staat-nu-niet-meer-publiek'
					  )
			);
			closeModal({
				...collection,
				...newCollectionProps,
			});

			// Public status changed => log as event
			trackEvents(
				{
					object: String(collection.id),
					object_type: isCollection() ? 'collection' : 'bundle',
					action: isPublished ? 'publish' : 'unpublish',
				},
				user
			);
		} catch (err) {
			ToastService.danger(
				tHtml(
					'collection/components/modals/share-collection-modal___de-aanpassingen-kunnen-niet-worden-opgeslagen'
				)
			);
		}
	};

	const closeModal = (newCollection?: Avo.Collection.Collection) => {
		setValidationError(undefined);
		onClose(newCollection);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={
				isCollection()
					? tHtml(
							'collection/components/modals/share-collection-modal___deel-deze-collectie'
					  )
					: tHtml(
							'collection/components/modals/publish-collection-modal___deel-deze-bundel'
					  )
			}
			size="large"
			onClose={closeModal}
			scrollable
		>
			<ModalBody>
				<p>
					{isCollection()
						? tHtml(
								'collection/components/modals/share-collection-modal___bepaal-in-hoeverre-jouw-collectie-toegankelijk-is-voor-andere-personen'
						  )
						: tHtml(
								'collection/components/modals/share-collection-modal___bepaal-in-hoeverre-jouw-bundel-toegankelijk-is-voor-andere-personen'
						  )}
				</p>
				<FormGroup error={validationError}>
					<Spacer margin="top-large">
						<BlockHeading className="u-m-0" type="h4">
							{tHtml(
								'collection/components/modals/share-collection-modal___zichtbaarheid'
							)}
						</BlockHeading>
					</Spacer>
					<RadioButtonGroup
						options={[
							{
								value: 'private',
								label: tText(
									'collection/components/modals/share-collection-modal___niet-openbaar'
								),
							},
							{
								value: 'public',
								label: tText(
									'collection/components/modals/share-collection-modal___openbaar'
								),
							},
						]}
						value={isCollectionPublic ? 'public' : 'private'}
						onChange={(value: string) => {
							setIsCollectionPublic(value === 'public');
						}}
					/>
				</FormGroup>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									type="secondary"
									label={tText(
										'collection/components/modals/share-collection-modal___annuleren'
									)}
									onClick={() => onClose()}
								/>
								<Button
									type="primary"
									label={tText(
										'collection/components/modals/share-collection-modal___opslaan'
									)}
									onClick={onSave}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default PublishCollectionModal;
