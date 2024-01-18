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
import { type Avo } from '@viaa/avo2-types';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { AssignmentLayout } from '../../../assignment/assignment.types';
import { QuickLaneService } from '../../../quick-lane/quick-lane.service';
import useTranslation from '../../../shared/hooks/useTranslation';
import { copyQuickLaneToClipboard } from '../../helpers/generate-quick-lane-href';
import withUser, { UserProps } from '../../hocs/withUser';
import { useDebounce } from '../../hooks/useDebounce';
import { ToastService } from '../../services/toast-service';
import { QuickLaneUrlObject } from '../../types';
import { ContentLink } from '../ContentLink/ContentLink';
import { LayoutOptions } from '../LayoutOptions/LayoutOptions';
import QuickLaneLink from '../QuickLaneLink/QuickLaneLink';

import { defaultQuickLaneState, getContentUuid, isShareable } from './QuickLaneModal.helpers';
import { QuickLaneModalProps } from './QuickLaneModal.types';

const QuickLaneModalSharingTab: FunctionComponent<QuickLaneModalProps & UserProps> = ({
	isOpen,
	user,
	content,
	content_label,
}) => {
	const { tText, tHtml } = useTranslation();

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
						getContentUuid(content, content_label),
						content_label,
						(user.profile as Avo.User.Profile).id
					);

					if (items.length === 0 && isShareable(content)) {
						items = await QuickLaneService.insertQuickLanes([
							{
								// Initialise with content title
								...quickLane,
								title: content.title as string,
								content_label,
								content_id: getContentUuid(content, content_label),
								owner_profile_id: (user.profile as Avo.User.Profile).id,
							},
						]);

						ToastService.success(
							tHtml(
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
	}, [content, exists]);

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
						content_id: getContentUuid(content, content_label),
						owner_profile_id: (user.profile as Avo.User.Profile).id,
					});

					if (updated.length === 1) {
						setSynced(true);
						setQuickLane({
							...object,
							...updated[0],
						});

						ToastService.success(
							tHtml(
								'shared/components/quick-lane-modal/quick-lane-modal___je-gedeelde-link-is-succesvol-aangepast'
							)
						);
					}
				}
			}
		})();
	}, [debounced]);

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
					label={tText('shared/components/quick-lane-modal/quick-lane-modal___titel')}
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
					label={tText('shared/components/quick-lane-modal/quick-lane-modal___inhoud')}
				>
					{content_label && (
						<ContentLink
							parent={{
								content_label,
								content_id: `${
									content_label === 'ITEM'
										? (content as Avo.Item.Item).external_id
										: content.id
								}`,
							}}
							content={content}
						/>
					)}
				</FormGroup>
			</Spacer>

			<Spacer margin={['bottom']}>
				<FormGroup
					label={tText(
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
									label={tText(
										'shared/components/quick-lane-modal/quick-lane-modal___kopieer-link'
									)}
									onClick={() => copyQuickLaneToClipboard(quickLane.id)}
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
