import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	FormGroup,
	Modal,
	ModalBody,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileName } from '../../../authentication/helpers/get-profile-info';
import { ToastService } from '../../../shared/services';
import { trackEvents } from '../../../shared/services/event-logging-service';
import i18n from '../../../shared/translations/i18n';
import { UPDATE_COLLECTION } from '../../collection.gql';
import { getValidationErrorsForPublish } from '../../collection.helpers';
import { CollectionService } from '../../collection.service';

interface ShareCollectionModalProps extends DefaultSecureRouteProps {
	isOpen: boolean;
	onClose: (collection?: Avo.Collection.Collection) => void;
	setIsPublic: (value: any) => void;
	collection: Avo.Collection.Collection;
}

const GET_SHARE_OPTIONS = () => [
	{
		value: 'private',
		label: i18n.t('collection/components/modals/share-collection-modal___niet-openbaar'),
		isPublic: false,
	},
	{
		value: 'public',
		label: i18n.t('collection/components/modals/share-collection-modal___openbaar'),
		isPublic: true,
	},
];

const ShareCollectionModal: FunctionComponent<ShareCollectionModalProps> = ({
	onClose,
	isOpen,
	collection,
	setIsPublic,
	user,
}) => {
	const [t] = useTranslation();

	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [isCollectionPublic, setIsCollectionPublic] = useState(collection.is_public);
	const [triggerCollectionPropertyUpdate] = useMutation(UPDATE_COLLECTION);

	const isCollection = () => {
		return collection.type_id === 3;
	};

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
				const validationErrors: string[] = getValidationErrorsForPublish(collection);

				if (validationErrors && validationErrors.length) {
					setValidationError(validationErrors.map(rule => get(rule[1], 'error')));
					ToastService.danger(validationErrors);
					return;
				}

				// Check if title and description is,'t the same as an existing published collection
				const duplicates = await CollectionService.getCollectionByTitleOrDescription(
					collection.title,
					collection.description
				);

				if (duplicates.byTitle) {
					ToastService.danger(
						isCollection()
							? t(
									'collection/components/modals/share-collection-modal___een-publieke-collectie-met-deze-titel-bestaat-reeds'
							  )
							: t(
									'collection/components/modals/share-collection-modal___een-publieke-bundel-met-deze-titel-bestaat-reeds'
							  )
					);
					return;
				}

				if (duplicates.byDescription) {
					ToastService.danger(
						isCollection()
							? t(
									'collection/components/modals/share-collection-modal___een-publieke-collectie-met-deze-beschrijving-bestaat-reeds'
							  )
							: t(
									'collection/components/modals/share-collection-modal___een-publieke-bundel-met-deze-beschrijving-bestaat-reeds'
							  )
					);
					return;
				}
			}

			setIsPublic(isCollectionPublic);

			const newCollection: Avo.Collection.Collection = {
				is_public: isCollectionPublic,
				published_at: new Date().toISOString(),
			} as Avo.Collection.Collection;
			await triggerCollectionPropertyUpdate({
				variables: {
					id: collection.id,
					collection: newCollection,
				},
			});
			setValidationError(undefined);
			ToastService.success(
				isCollection()
					? isCollectionPublic
						? t(
								'collection/components/modals/share-collection-modal___de-collectie-staat-nu-publiek'
						  )
						: t(
								'collection/components/modals/share-collection-modal___de-collectie-staat-nu-niet-meer-publiek'
						  )
					: isCollectionPublic
					? t(
							'collection/components/modals/share-collection-modal___de-bundel-staat-nu-publiek'
					  )
					: t(
							'collection/components/modals/share-collection-modal___de-bundel-staat-nu-niet-meer-publiek'
					  )
			);
			closeModal(newCollection);

			// Public status changed => log as event
			trackEvents(
				{
					object: String(collection.id),
					object_type: 'collections',
					message: `Gebruiker ${getProfileName(user)} heeft de ${
						isCollection() ? 'collectie' : 'bundel'
					} ${collection.id} ${isPublished ? 'gepubliceerd' : 'gedepubliceerd'}`,
					action: isPublished ? 'publish' : 'unpublish',
				},
				user
			);
		} catch (err) {
			ToastService.danger(
				t(
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
					? t('collection/components/modals/share-collection-modal___deel-deze-collectie')
					: t('Deel deze bundel')
			}
			size="large"
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				<p>
					{isCollection() ? (
						<Trans i18nKey="collection/components/modals/share-collection-modal___bepaal-in-hoeverre-jouw-collectie-toegankelijk-is-voor-andere-personen">
							Bepaal in hoeverre jouw collectie toegankelijk is voor andere personen.
						</Trans>
					) : (
						<Trans i18nKey="collection/components/modals/share-collection-modal___bepaal-in-hoeverre-jouw-bundel-toegankelijk-is-voor-andere-personen">
							Bepaal in hoeverre jouw bundel toegankelijk is voor andere personen.
						</Trans>
					)}
				</p>
				<FormGroup error={validationError}>
					<Spacer margin="top-large">
						<BlockHeading className="u-m-0" type="h4">
							<Trans i18nKey="collection/components/modals/share-collection-modal___zichtbaarheid">
								Zichtbaarheid
							</Trans>
						</BlockHeading>
					</Spacer>
					<RadioButtonGroup>
						{GET_SHARE_OPTIONS().map((shareOption, index) => (
							<RadioButton
								key={index}
								name={shareOption.value}
								label={shareOption.label}
								value={shareOption.value}
								onChange={() => setIsCollectionPublic(shareOption.isPublic)}
								checked={isCollectionPublic === shareOption.isPublic}
							/>
						))}
					</RadioButtonGroup>
				</FormGroup>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									type="secondary"
									label={t(
										'collection/components/modals/share-collection-modal___annuleren'
									)}
									onClick={() => onClose()}
								/>
								<Button
									type="primary"
									label={t(
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

export default ShareCollectionModal;
