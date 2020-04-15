import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

import { ToastService } from '../../../shared/services';
import { DbContent } from '../content.types';

interface ShareContentPageModalProps {
	isOpen: boolean;
	onClose: (contentPage?: Partial<DbContent>) => any;
	contentPage: DbContent;
}

const ShareContentPageModal: FunctionComponent<ShareContentPageModalProps> = ({
	onClose,
	isOpen,
	contentPage,
}) => {
	const [t] = useTranslation();

	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [isContentPublic, setIsContentPublic] = useState(contentPage.is_public);

	const onSave = async () => {
		try {
			const isPublished = isContentPublic && !contentPage.is_public;
			const isDepublished = !isContentPublic && contentPage.is_public;

			// Close modal when isPublic doesn't change
			if (!isPublished && !isDepublished) {
				onClose();
				return;
			}

			// Validate if user wants to publish
			if (isPublished) {
				// TODO see if any validation rules are needed
				// const validationErrors: string[] = getValidationErrorsForPublish(Content);
				//
				// if (validationErrors && validationErrors.length) {
				// 	setValidationError(validationErrors.map(rule => get(rule[1], 'error')));
				// 	ToastService.danger(validationErrors);
				// 	return;
				// }
			}

			const newContent: DbContent = {
				is_public: isContentPublic,
				// published_at: new Date().toISOString(), // Wait for https://meemoo.atlassian.net/browse/DEV-778
			} as DbContent;
			setValidationError(undefined);
			closeModal(newContent);
		} catch (err) {
			ToastService.danger(
				t(
					'admin/content/components/share-content-page-modal___de-aanpassingen-kunnen-niet-worden-opgeslagen'
				)
			);
		}
	};

	const closeModal = (newContent?: Avo.Content.Content) => {
		setValidationError(undefined);
		onClose(newContent);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t(
				'admin/content/components/share-content-page-modal___maak-deze-content-pagina-publiek'
			)}
			size="large"
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				<p>
					{t(
						'admin/content/components/share-content-page-modal___bepaald-in-hoevere-je-pagina-zichtbaar-is-voor-andere-gebruikers'
					)}
				</p>
				<FormGroup error={validationError}>
					<Spacer margin="top-large">
						<BlockHeading className="u-m-0" type="h4">
							{t('admin/content/components/share-content-page-modal___zichtbaarheid')}
						</BlockHeading>
					</Spacer>
					<RadioButtonGroup>
						<RadioButton
							key="private"
							name="private"
							label={t('admin/content/components/share-content-page-modal___prive')}
							value="private"
							checked={!isContentPublic}
						/>
						<RadioButton
							key="public"
							name="private"
							label={t(
								'admin/content/components/share-content-page-modal___openbaar'
							)}
							value="public"
							onChange={setIsContentPublic}
							checked={isContentPublic}
						/>
					</RadioButtonGroup>
				</FormGroup>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									type="secondary"
									label={t(
										'admin/content/components/share-content-page-modal___annuleren'
									)}
									onClick={() => onClose()}
								/>
								<Button
									type="primary"
									label={t(
										'admin/content/components/share-content-page-modal___opslaan'
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

export default ShareContentPageModal;
