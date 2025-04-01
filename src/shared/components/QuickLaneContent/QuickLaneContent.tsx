import { Alert, Spacer, Tabs } from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { type FC, useEffect, useState } from 'react';

import { PermissionService } from '../../../authentication/helpers/permission-service';
import useTranslation from '../../../shared/hooks/useTranslation';
import withUser, { type UserProps } from '../../hocs/withUser';
import { useTabs } from '../../hooks/useTabs';
import { ToastService } from '../../services/toast-service';

import { isShareable } from './QuickLaneContent.helpers';
import { type QuickLaneContentProps } from './QuickLaneContent.types';
import QuickLaneContentPublicationTab from './QuickLaneContentPublicationTab';
import QuickLaneContentSharingTab from './QuickLaneContentSharingTab';
import './QuickLaneContent.scss';

// State

const QuickLaneContentTabs = {
	publication: 'publication',
	sharing: 'sharing',
};

// Helpers

const needsToPublish = async (commonUser: Avo.User.CommonUser) => {
	return await PermissionService.hasPermissions(
		[PermissionName.REQUIRED_PUBLICATION_DETAILS_ON_QUICK_LANE],
		commonUser
	);
};

const isAllowedToPublish = async (
	commonUser: Avo.User.CommonUser,
	collection?: Avo.Collection.Collection
) => {
	return (
		// Is the author && can publish his own collections
		(collection?.owner_profile_id === commonUser?.profileId &&
			(await PermissionService.hasPermissions(
				[PermissionName.PUBLISH_OWN_COLLECTIONS],
				commonUser
			))) ||
		// Is not the author but can publish any collections
		(await PermissionService.hasPermissions(
			[PermissionName.PUBLISH_ANY_COLLECTIONS],
			commonUser
		))
	);
};

// Component

const QuickLaneContent: FC<QuickLaneContentProps & UserProps> = (props) => {
	const { content_label, commonUser } = props;

	const [content, setContent] = useState<
		Avo.Assignment.Assignment | Avo.Collection.Collection | Avo.Item.Item | undefined
	>(props.content);

	const { tText, tHtml } = useTranslation();

	const [isPublishRequired, setIsPublishRequired] = useState(false);
	const [canPublish, setCanPublish] = useState(false);

	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: QuickLaneContentTabs.publication,
				label: tText(
					'shared/components/quick-lane-modal/quick-lane-modal___publicatiedetails'
				),
			},
			{
				id: QuickLaneContentTabs.sharing,
				label: tText('shared/components/quick-lane-modal/quick-lane-modal___snel-delen'),
			},
		],
		QuickLaneContentTabs.publication
	);

	// Sync prop with state
	useEffect(() => {
		setContent(props.content);
	}, [props.content, setContent]);

	// Check permissions
	useEffect(() => {
		async function checkPermissions() {
			if (content_label === 'COLLECTIE' && commonUser) {
				setIsPublishRequired(await needsToPublish(commonUser));
				setCanPublish(
					await isAllowedToPublish(commonUser, content as Avo.Collection.Collection)
				);
			}
		}

		checkPermissions().then(noop);
	}, [commonUser, content, content_label]);

	useEffect(() => {
		const shouldBePublishedFirst =
			content_label === 'COLLECTIE' &&
			isPublishRequired &&
			content &&
			!(content as Avo.Collection.Collection).is_public; // AVO-1880

		setActiveTab(
			canPublish && shouldBePublishedFirst
				? QuickLaneContentTabs.publication
				: QuickLaneContentTabs.sharing
		);
	}, [setActiveTab, isPublishRequired, content_label, content, canPublish]);

	const getTabs = () => {
		// AVO-1880
		if ((content as Avo.Collection.Collection).is_public) {
			return [];
		}

		return tabs.filter((tab) => {
			switch (tab.id) {
				case QuickLaneContentTabs.publication:
					return content_label === 'COLLECTIE' && canPublish;

				default:
					return true;
			}
		});
	};

	const renderContentNotShareableWarning = (): string => {
		switch (content_label) {
			case 'ITEM':
				return tText(
					'shared/components/quick-lane-modal/quick-lane-modal___item-is-niet-gepubliceerd'
				);

			case 'COLLECTIE':
				return tab === QuickLaneContentTabs.publication
					? tText(
							'shared/components/quick-lane-modal/quick-lane-modal___collectie-is-niet-publiek'
					  )
					: tText(
							'shared/components/quick-lane-modal/quick-lane-modal___collectie-is-niet-publiek--niet-auteur'
					  );

			default:
				return '';
		}
	};

	const renderTab = () => {
		switch (tab) {
			case 'publication':
				return (
					<QuickLaneContentPublicationTab
						{...props}
						content={content}
						onUpdate={setContent}
						onComplete={() => setActiveTab(QuickLaneContentTabs.sharing)}
					/>
				);
			case 'sharing':
				return (
					<QuickLaneContentSharingTab
						{...props}
						content={content}
						onUpdate={setContent}
					/>
				);

			default:
				return undefined;
		}
	};

	return (
		<>
			{commonUser && content && content_label ? (
				<>
					{getTabs().length > 1 && (
						<Spacer className="m-quick-lane-content__tabs-wrapper" margin={'bottom'}>
							<Tabs
								tabs={getTabs()}
								onClick={(tab) => {
									switch (tab.toString() as keyof typeof QuickLaneContentTabs) {
										case 'publication':
											setActiveTab(tab);
											break;

										case 'sharing':
											if (!isPublishRequired || isShareable(content)) {
												setActiveTab(tab);
											} else {
												ToastService.danger(
													tHtml(
														'shared/components/quick-lane-modal/quick-lane-modal___dit-item-kan-nog-niet-gedeeld-worden'
													)
												);
											}
											break;

										default:
											break;
									}
								}}
							/>
						</Spacer>
					)}

					{!isShareable(content) && content_label === 'COLLECTIE' && (
						<Spacer margin={['bottom']}>
							<Alert type={content_label === 'COLLECTIE' ? 'info' : 'danger'}>
								<p>{renderContentNotShareableWarning()}</p>
							</Alert>
						</Spacer>
					)}

					{renderTab()}
				</>
			) : (
				<Spacer margin={['bottom-small']}>
					{props.error ||
						tText(
							'shared/components/quick-lane-modal/quick-lane-modal___er-ging-iets-mis'
						)}
				</Spacer>
			)}
		</>
	);
};

export default withUser(QuickLaneContent) as FC<QuickLaneContentProps>;
