import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
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
import { QuickLaneService, QuickLaneUrlObject } from '../../../quick-lane/quick-lane.service';
import withUser, { UserProps } from '../../hocs/withUser';
import { useDebounce } from '../../hooks';
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
	return `https://example.com/url/structure/${id}`;
};

const getContentId = (content: AssignmentContent, contentLabel: AssignmentContentLabel): string => {
	switch (contentLabel) {
		case 'ITEM':
			return (content as ItemSchema).uid;
		default:
			return content.id.toString();
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
	const [quickLane, setQuickLane] = useState<QuickLaneUrlObject>(defaultQuickLaneState);
	const [exists, setExists] = useState<boolean>(false);
	const [synced, setSynced] = useState<boolean>(false);
	const debounced = useDebounce(quickLane, 300);

	// If the modal is open and we haven't checked if anything exists, fetch or create the record
	useEffect(() => {
		isOpen &&
			!exists &&
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
									...quickLane,
									content_label,
									content_id: getContentId(content, content_label),
									owner_profile_id: (user.profile as UserProfile).id,
								},
							]);
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
	}, [isOpen]);

	// When debounced changes occur, synchronise the changes with the database
	useEffect(() => {
		const object = debounced as QuickLaneUrlObject;

		isOpen &&
			exists &&
			object.id.length > 0 &&
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
						}
					}
				}
			})();
	}, [debounced]);

	// Set initial title before fetching to avoid FoUC
	if (!quickLane.title && content?.title) {
		setQuickLane({
			...quickLane,
			title: content.title,
		});
	}

	return (
		<Modal
			className="m-quick-lane-modal"
			title={modalTitle}
			size="medium"
			isOpen={isOpen}
			onClose={onClose}
			scrollable
		>
			{user && content ? (
				<ModalBody>
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

					<Spacer margin={content_label === 'ITEM' ? ['top', 'bottom'] : ['bottom']}>
						<FormGroup
							required
							label={t('shared/components/quick-lane-modal/quick-lane-modal___titel')}
						>
							<TextInput
								id="title"
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

					<Spacer margin={['top', 'bottom']}>
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

					<Spacer margin={['top', 'bottom']}>
						<FormGroup
							label={t(
								'shared/components/quick-lane-modal/quick-lane-modal___weergave-voor-leerlingen'
							)}
						>
							<LayoutOptions
								item={{ content_layout: quickLane.view_mode }}
								onChange={(value: string) => {
									setQuickLane({
										...quickLane,
										view_mode: (value as unknown) as AssignmentLayout, // TS2353
									});
								}}
							/>
						</FormGroup>
					</Spacer>

					{quickLane.id && (
						<Spacer margin={['top', 'bottom-small']}>
							<Box backgroundColor="gray" condensed>
								<Flex wrap justify="between" align="baseline">
									<FlexItem className="u-truncate m-quick-lane-modal__link">
										<a href={buildQuickLaneHref(quickLane.id)}>
											{buildQuickLaneHref(quickLane.id)}
										</a>
									</FlexItem>
									<FlexItem shrink>
										<Spacer margin="left-small">
											<Button
												label={t(
													'shared/components/quick-lane-modal/quick-lane-modal___kopieer-link'
												)}
												onClick={() => {
													//
												}}
											/>
										</Spacer>
									</FlexItem>
								</Flex>
							</Box>
						</Spacer>
					)}
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
