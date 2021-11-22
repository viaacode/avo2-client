import { TFunction } from 'i18next';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useHistory } from 'react-router';

import {
	Alert,
	Avatar,
	Box,
	Button,
	Flex,
	FlexItem,
	FormGroup,
	Modal,
	ModalBody,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';
import { AssignmentContent, AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';
import { CollectionSchema } from '@viaa/avo2-types/types/collection';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import { UserProfile } from '@viaa/avo2-types/types/user';

import { AssignmentLayout } from '../../../assignment/assignment.types';
import { APP_PATH } from '../../../constants';
import { QuickLaneService, QuickLaneUrlObject } from '../../../quick-lane/quick-lane.service';
import withUser, { UserProps } from '../../hocs/withUser';
import { useDebounce } from '../../hooks';
import { ToastService } from '../../services';
import { ContentLink } from '../ContentLink/ContentLink';
import { LayoutOptions } from '../LayoutOptions/LayoutOptions';

import './QuickLaneModal.scss';

// Typings

interface QuickLaneModalProps {
	modalTitle: string;
	isOpen: boolean;
	content?: AssignmentContent;
	content_label?: AssignmentContentLabel;
	onClose: () => void;
}

// State

const defaultQuickLaneState: QuickLaneUrlObject = {
	id: '',
	title: '',
	view_mode: AssignmentLayout.PlayerAndText,
};

// Helpers

const buildQuickLaneHref = (id: string): string => {
	return generatePath(APP_PATH.QUICK_LANE.route, { id });
};

const getContentId = (content: AssignmentContent, contentLabel: AssignmentContentLabel): string => {
	switch (contentLabel) {
		case 'ITEM':
			return (content as ItemSchema).uid;
		default:
			return content.id.toString();
	}
};

const getContentNotShareableWarning = (
	contentLabel: AssignmentContentLabel,
	t: TFunction
): string => {
	switch (contentLabel) {
		case 'ITEM':
			return t(
				'shared/components/quick-lane-modal/quick-lane-modal___item-is-niet-gepubliceerd'
			);

		case 'COLLECTIE':
			return t(
				'shared/components/quick-lane-modal/quick-lane-modal___collectie-is-niet-publiek'
			);

		default:
			return '';
	}
};

const isShareable = (content: AssignmentContent): boolean => {
	return (content as ItemSchema).is_published || (content as CollectionSchema).is_public;
};

// Component

const QuickLaneModal: FunctionComponent<QuickLaneModalProps & UserProps> = ({
	modalTitle,
	isOpen,
	content,
	content_label,
	onClose,
	user,
}) => {
	const [t] = useTranslation();
	const history = useHistory();
	const [quickLane, setQuickLane] = useState<QuickLaneUrlObject>(defaultQuickLaneState);
	const [exists, setExists] = useState<boolean>(false);
	const [synced, setSynced] = useState<boolean>(false);
	const debounced = useDebounce(quickLane, 300);

	// If the modal is open and we haven't checked if anything exists, fetch or create the record
	useEffect(() => {
		if (!isOpen || exists) {
			return;
		}

		(async () => {
			if (content && content_label) {
				if (user && user.profile !== null) {
					let items = await QuickLaneService.fetchQuickLaneByContentAndOwnerId(
						getContentId(content, content_label),
						content_label,
						(user.profile as UserProfile).id
					);

					if (items.length === 0 && isShareable(content)) {
						items = await QuickLaneService.insertQuickLanes([
							{
								// Initialise with content title
								...{
									...quickLane,
									title: content.title,
								},
								content_label,
								content_id: getContentId(content, content_label),
								owner_profile_id: (user.profile as UserProfile).id,
							},
						]);

						ToastService.success(
							t(
								'shared/components/quick-lane-modal/quick-lane-modal___je-gedeelde-link-is-succesvol-aangemaakt'
							)
						);
					}

					if (items.length === 1) {
						setExists(true);
						setSynced(true);
						setQuickLane({
							...quickLane,
							...items[0],
						});
					}
				}
			}
		})();
	}, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

	// When debounced changes occur, synchronise the changes with the database
	useEffect(() => {
		const object = debounced as QuickLaneUrlObject;

		if (!isOpen || !exists || object.id.length <= 0) {
			return;
		}

		(async () => {
			// Ignore the first change after sync
			if (synced) {
				setSynced(false);
			} else if (content && content_label) {
				if (user && user.profile !== null) {
					const updated = await QuickLaneService.updateQuickLaneById(object.id, {
						...object,
						content_label,
						content_id: getContentId(content, content_label),
						owner_profile_id: (user.profile as UserProfile).id,
					});

					if (updated.length === 1) {
						setSynced(true);
						setQuickLane({
							...object,
							...updated[0],
						});

						ToastService.success(
							t(
								'shared/components/quick-lane-modal/quick-lane-modal___je-gedeelde-link-is-succesvol-aangepast'
							)
						);
					}
				}
			}
		})();
	}, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Modal
			className="m-quick-lane-modal"
			title={modalTitle}
			size="medium"
			isOpen={isOpen}
			onClose={onClose}
			scrollable
		>
			{user && content && content_label ? (
				<ModalBody>
					{!isShareable(content) && (
						<Spacer margin={['bottom']}>
							<Alert type="danger">
								<p>{getContentNotShareableWarning(content_label, t)}</p>

								{content_label === 'COLLECTIE' && (
									<Spacer margin={['top-small']}>
										<Button
											type="danger"
											icon="file-text"
											label={t(
												'shared/components/quick-lane-modal/quick-lane-modal___publicatiedetails'
											)}
											onClick={() => {
												onClose();
												history.push(
													generatePath(
														APP_PATH.COLLECTION_EDIT_TAB.route,
														{
															id: getContentId(
																content,
																content_label
															),
															tabId: 'metadata',
														}
													)
												);
											}}
										/>
									</Spacer>
								)}
							</Alert>
						</Spacer>
					)}

					{content_label === 'ITEM' && (
						<Spacer margin={['bottom']}>
							<Avatar
								className="m-quick-lane-modal__avatar"
								dark={true}
								name={(content as ItemSchema).organisation.name}
								image={(content as ItemSchema).organisation.logo_url}
							/>
						</Spacer>
					)}

					<Spacer margin={['bottom']}>
						<FormGroup
							required
							label={t('shared/components/quick-lane-modal/quick-lane-modal___titel')}
						>
							<TextInput
								id="title"
								disabled={!quickLane.id}
								value={quickLane.title}
								onChange={(title: string) =>
									setQuickLane({
										...quickLane,
										title,
									})
								}
							/>
						</FormGroup>
					</Spacer>

					<Spacer margin={['bottom']}>
						<FormGroup
							label={t(
								'shared/components/quick-lane-modal/quick-lane-modal___inhoud'
							)}
						>
							{content_label && (
								<ContentLink
									parent={{
										content_label,
										content_id: getContentId(content, content_label),
									}}
									content={content}
									user={user}
								/>
							)}
						</FormGroup>
					</Spacer>

					<Spacer margin={['bottom']}>
						<FormGroup
							label={t(
								'shared/components/quick-lane-modal/quick-lane-modal___weergave-voor-leerlingen'
							)}
						>
							<LayoutOptions
								item={{ content_layout: quickLane.view_mode }}
								disabled={!quickLane.id}
								onChange={(value: string) => {
									setQuickLane({
										...quickLane,
										view_mode: (value as unknown) as AssignmentLayout, // TS2353
									});
								}}
							/>
						</FormGroup>
					</Spacer>

					<Spacer margin={['bottom']}>
						<Box backgroundColor="gray" condensed>
							<Flex wrap justify="between" align="baseline">
								<FlexItem className="u-truncate m-quick-lane-modal__link">
									{quickLane.id && (
										<a href={buildQuickLaneHref(quickLane.id)}>
											{window.location.origin}
											{buildQuickLaneHref(quickLane.id)}
										</a>
									)}
								</FlexItem>
								<FlexItem shrink>
									<Spacer margin="left-small">
										<Button
											disabled={!quickLane.id}
											label={t(
												'shared/components/quick-lane-modal/quick-lane-modal___kopieer-link'
											)}
											onClick={() => {
												navigator.clipboard.writeText(
													`${window.location.origin}${buildQuickLaneHref(
														quickLane.id
													)}`
												);
											}}
										/>
									</Spacer>
								</FlexItem>
							</Flex>
						</Box>
					</Spacer>
				</ModalBody>
			) : (
				<ModalBody>
					<Spacer margin={['bottom-small']}>
						{t(
							'shared/components/quick-lane-modal/quick-lane-modal___er-ging-iets-mis'
						)}
					</Spacer>
				</ModalBody>
			)}
		</Modal>
	);
};

export default withUser(QuickLaneModal) as FunctionComponent<QuickLaneModalProps>;
