import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	DatePicker,
	Form,
	FormGroup,
	Icon,
	Modal,
	ModalBody,
	RadioButtonGroup,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';

import Html from '../../../shared/components/Html/Html';
import { ToastService } from '../../../shared/services';
import { ContentPageInfo } from '../content.types';
import { getPublishedState } from '../helpers/get-published-state';

import './PublishContentPageModal.scss';

type publishOption = 'private' | 'public' | 'timebound';

interface PublishContentPageModalProps {
	isOpen: boolean;
	onClose: (contentPage?: Partial<ContentPageInfo>) => void;
	contentPage: ContentPageInfo;
}

const PublishContentPageModal: FunctionComponent<PublishContentPageModalProps> = ({
	onClose,
	isOpen,
	contentPage,
}) => {
	const [t] = useTranslation();

	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [selectedOption, setSelectedOption] = useState<publishOption>(
		getPublishedState(contentPage)
	);
	const [publishedAt, setPublishedAt] = useState<string | null>(contentPage.published_at);
	const [publishAt, setPublishAt] = useState<string | null>(contentPage.publish_at);
	const [depublishAt, setDepublishAt] = useState<string | null>(contentPage.depublish_at);

	const onSave = async () => {
		try {
			const now = new Date();
			const newContent: Partial<ContentPageInfo> = {
				is_public:
					selectedOption === 'public' ||
					(selectedOption === 'timebound' &&
						((publishAt &&
							new Date(publishAt) < now &&
							((depublishAt && new Date(depublishAt) > now) || !depublishAt)) ||
							(!publishAt &&
								(!depublishAt || (depublishAt && new Date(depublishAt) > now))))),
				published_at:
					publishedAt || (selectedOption === 'public' ? now.toISOString() : null),
				publish_at: selectedOption === 'timebound' ? publishAt : null,
				depublish_at: selectedOption === 'timebound' ? depublishAt : null,
			} as Partial<ContentPageInfo>;
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

	const resetModal = () => {
		setSelectedOption(getPublishedState(contentPage));
		setPublishAt(contentPage.publish_at);
		setDepublishAt(contentPage.depublish_at);
	};

	const closeModal = (newContent?: Partial<ContentPageInfo>) => {
		if (!newContent) {
			resetModal();
		} else {
			setValidationError(undefined);
		}
		onClose(newContent);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t(
				'admin/content/components/share-content-page-modal___maak-deze-content-pagina-publiek'
			)}
			size="large"
			onClose={closeModal}
			scrollable={false}
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
					<RadioButtonGroup
						options={[
							{
								label: t(
									'admin/content/components/share-content-page-modal___prive'
								),
								value: 'private',
							},
							{
								label: t(
									'admin/content/components/share-content-page-modal___openbaar'
								),
								value: 'public',
							},
							{
								label: t(
									'admin/content/components/share-content-page-modal___tijdsgebonden'
								),
								value: 'timebound',
							},
						]}
						value={selectedOption}
						onChange={setSelectedOption as (value: string) => void}
					/>
				</FormGroup>
				<Spacer margin="left-large">
					<Form>
						<FormGroup
							label={t(
								'admin/content/components/share-content-page-modal___publiceren-op'
							)}
						>
							<DatePicker
								value={publishAt ? new Date(publishAt) : null}
								onChange={(date) => setPublishAt(date ? date.toISOString() : null)}
								showTimeInput={true}
								disabled={selectedOption !== 'timebound'}
							/>
						</FormGroup>
						<FormGroup
							label={t(
								'admin/content/components/share-content-page-modal___depubliceren-op'
							)}
						>
							<DatePicker
								value={depublishAt ? new Date(depublishAt) : null}
								onChange={(date) =>
									setDepublishAt(date ? date.toISOString() : null)
								}
								showTimeInput={true}
								disabled={selectedOption !== 'timebound'}
							/>
						</FormGroup>
					</Form>
				</Spacer>

				<FormGroup
					label={t(
						'admin/content/components/publish-content-page-modal___display-datum-optioneel'
					)}
					className="c-content-page-publish-modal__display-date"
				>
					<Spacer>
						<DatePicker
							value={publishedAt ? new Date(publishedAt) : null}
							onChange={(date) => setPublishedAt(date ? date.toISOString() : null)}
						/>
						<Tooltip position="right">
							<TooltipTrigger>
								<Icon className="a-info-icon" name="info" size="small" />
							</TooltipTrigger>
							<TooltipContent>
								<Html
									content={t(
										'admin/content/components/publish-content-page-modal___tooltip-display-date'
									)}
									sanitizePreset={'basic'}
								/>
							</TooltipContent>
						</Tooltip>
					</Spacer>
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
									onClick={() => closeModal()}
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

export default PublishContentPageModal;
