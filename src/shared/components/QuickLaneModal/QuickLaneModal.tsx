import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Modal, ModalBody, Spacer, Tabs } from '@viaa/avo2-components';
import { CollectionSchema } from '@viaa/avo2-types/types/collection';
import { UserSchema } from '@viaa/avo2-types/types/user';

import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { isCollection } from '../../../quick-lane/quick-lane.helpers';
import withUser, { UserProps } from '../../hocs/withUser';
import { useTabs } from '../../hooks';
import { ToastService } from '../../services';

import { isShareable } from './QuickLaneModal.helpers';
import './QuickLaneModal.scss';
import { QuickLaneModalProps } from './QuickLaneModal.types';
import QuickLaneModalPublicationTab from './QuickLaneModalPublicationTab';
import QuickLaneModalSharingTab from './QuickLaneModalSharingTab';

// State

const QuickLaneModalTabs = {
	publication: 'publication',
	sharing: 'sharing',
};

// Helpers

const needsToPublish = async (user: UserSchema) => {
	return await PermissionService.hasPermissions(
		[PermissionName.REQUIRED_PUBLICATION_DETAILS_ON_QUICK_LANE],
		user
	);
};

// Component

const QuickLaneModal: FunctionComponent<QuickLaneModalProps & UserProps> = (props) => {
	const { modalTitle, isOpen, content, content_label, onClose, user } = props;

	const [t] = useTranslation();
	const [publishRequired, setPublishRequired] = useState(false);
	const [isCollectionAuthor, setIsCollectionAuthor] = useState(false);

	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: QuickLaneModalTabs.publication,
				label: t('shared/components/quick-lane-modal/quick-lane-modal___publicatiedetails'),
			},
			{
				id: QuickLaneModalTabs.sharing,
				label: t('shared/components/quick-lane-modal/quick-lane-modal___snel-delen'),
			},
		],
		QuickLaneModalTabs.publication
	);

	// Check permissions
	useEffect(() => {
		async function checkPermissions() {
			user && setPublishRequired(await needsToPublish(user));
		}

		checkPermissions();
	}, [user]);

	useEffect(() => {
		isCollection({ content_label }) &&
			setIsCollectionAuthor(
				user?.profile?.id === (content as CollectionSchema).owner_profile_id
			);
	}, [user, content, content_label]);

	useEffect(() => {
		if (!isOpen) return;

		const shouldBePublishedFirst =
			isCollection({ content_label }) &&
			publishRequired &&
			isCollectionAuthor &&
			!(content as CollectionSchema).is_public; // AVO-1880

		setActiveTab(
			shouldBePublishedFirst ? QuickLaneModalTabs.publication : QuickLaneModalTabs.sharing
		);
	}, [isOpen, setActiveTab, publishRequired, content_label, isCollectionAuthor, content]);

	const getTabs = () => {
		// AVO-1880
		if ((content as CollectionSchema).is_public) {
			return [];
		}

		return tabs.filter((tab) => {
			switch (tab.id) {
				case QuickLaneModalTabs.publication:
					return isCollection({ content_label }) && isCollectionAuthor;

				default:
					return true;
			}
		});
	};

	const renderContentNotShareableWarning = (): string => {
		switch (content_label) {
			case 'ITEM':
				return t(
					'shared/components/quick-lane-modal/quick-lane-modal___item-is-niet-gepubliceerd'
				);

			case 'COLLECTIE':
				return tab === QuickLaneModalTabs.publication
					? t(
							'shared/components/quick-lane-modal/quick-lane-modal___collectie-is-niet-publiek'
					  )
					: t(
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
					<QuickLaneModalPublicationTab
						{...props}
						onComplete={() => setActiveTab(QuickLaneModalTabs.sharing)}
					/>
				);
			case 'sharing':
				return <QuickLaneModalSharingTab {...props} />;

			default:
				return undefined;
		}
	};

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
					{getTabs().length > 1 && (
						<Spacer className="m-quick-lane-modal__tabs-wrapper" margin={'bottom'}>
							<Tabs
								tabs={getTabs()}
								onClick={(tab) => {
									switch (tab.toString() as keyof typeof QuickLaneModalTabs) {
										case 'publication':
											setActiveTab(tab);
											break;

										case 'sharing':
											if (!publishRequired || isShareable(content)) {
												setActiveTab(tab);
											} else {
												ToastService.danger(
													t(
														'shared/components/quick-lane-modal/quick-lane-modal___dit-item-kan-nog-niet-gedeeld-worden'
													)
												);
											}
											break;

										default:
											break;
									}
								}}
							></Tabs>
						</Spacer>
					)}

					{!isShareable(content) && isCollection({ content_label }) && (
						<Spacer margin={['bottom']}>
							<Alert type={isCollection({ content_label }) ? 'info' : 'danger'}>
								<p>{renderContentNotShareableWarning()}</p>
							</Alert>
						</Spacer>
					)}

					{renderTab()}
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
