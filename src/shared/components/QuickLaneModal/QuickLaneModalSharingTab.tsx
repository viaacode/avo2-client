import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Avatar,
	Box,
	Button,
	Flex,
	FlexItem,
	FormGroup,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';
import { AssignmentLayout } from '@viaa/avo2-types/types/assignment';
import { UserProfile } from '@viaa/avo2-types/types/user';

import { QuickLaneService } from '../../../quick-lane/quick-lane.service';
import { generateQuickLaneHref } from '../../helpers/generate-quick-lane-href';
import withUser, { UserProps } from '../../hocs/withUser';
import { useDebounce } from '../../hooks';
import { ToastService } from '../../services';
import { QuickLaneUrlObject } from '../../types';
import { ContentLink } from '../ContentLink/ContentLink';
import { LayoutOptions } from '../LayoutOptions/LayoutOptions';
import QuickLaneLink from '../QuickLaneLink/QuickLaneLink';

import { defaultQuickLaneState, getContentId, isShareable } from './QuickLaneModal.helpers';
import { QuickLaneModalProps } from './QuickLaneModal.types';

const QuickLaneModalSharingTab: FunctionComponent<QuickLaneModalProps & UserProps> = ({
	isOpen,
	user,
	content,
	content_label,
}) => {
	const [t] = useTranslation();

	const [quickLane, setQuickLane] = useState<QuickLaneUrlObject>(defaultQuickLaneState);
	const [exists, setExists] = useState<boolean>(false);
	const [synced, setSynced] = useState<boolean>(false);

	const debounced = useDebounce(quickLane, 500);

	// If the modal is open and we haven't checked if anything exists, fetch or create the record
	useEffect(() => {
		if (exists) {
			return;
		}

		(async () => {
			if (isOpen && content && content_label) {
				if (user && user.profile !== null) {
					let items = await QuickLaneService.fetchQuickLanesByContentAndOwnerId(
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
	}, [content, exists]); // eslint-disable-line react-hooks/exhaustive-deps

	// When debounced changes occur, synchronise the changes with the database
	useEffect(() => {
		const object = debounced as QuickLaneUrlObject;

		if (!exists || object.id.length <= 0) {
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

	const avatar = {
		name: user?.profile?.organisation?.name,
		image: user?.profile?.organisation?.logo_url,
	};

	return user && content && content_label ? (
		<>
			{(avatar.name || avatar.image) && (
				<Spacer margin={['bottom']}>
					<Avatar
						className="m-quick-lane-modal__avatar"
						dark={true}
						name={avatar.name}
						image={avatar.image}
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
					label={t('shared/components/quick-lane-modal/quick-lane-modal___inhoud')}
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
								view_mode: value as unknown as AssignmentLayout, // TS2353
							});
						}}
					/>
				</FormGroup>
			</Spacer>

			<Spacer margin={['bottom']}>
				<Box backgroundColor="gray" condensed>
					<Flex wrap justify="between" align="baseline">
						<FlexItem className="u-truncate m-quick-lane-modal__link">
							{quickLane.id && <QuickLaneLink id={quickLane.id} />}
						</FlexItem>
						<FlexItem shrink>
							<Spacer margin="left-small">
								<Button
									disabled={!quickLane.id}
									label={t(
										'shared/components/quick-lane-modal/quick-lane-modal___kopieer-link'
									)}
									onClick={() => {
										navigator.clipboard
											.writeText(
												`${window.location.origin}${generateQuickLaneHref(
													quickLane.id
												)}`
											)
											.then(() => {
												ToastService.success(
													t(
														'shared/components/quick-lane-modal/quick-lane-modal-sharing-tab___de-link-is-succesvol-gekopieerd'
													)
												);
											});
									}}
								/>
							</Spacer>
						</FlexItem>
					</Flex>
				</Box>
			</Spacer>
		</>
	) : null;
};

export default withUser(QuickLaneModalSharingTab) as FunctionComponent<QuickLaneModalProps>;
