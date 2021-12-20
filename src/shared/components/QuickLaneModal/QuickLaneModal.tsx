import React, { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Modal, ModalBody, Spacer, Tabs } from '@viaa/avo2-components';

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

// Component

const QuickLaneModal: FunctionComponent<QuickLaneModalProps & UserProps> = (props) => {
	const { modalTitle, isOpen, content, content_label, onClose, user } = props;

	const [t] = useTranslation();

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

	useEffect(() => {
		isOpen &&
			content &&
			setActiveTab(
				isShareable(content) ? QuickLaneModalTabs.sharing : QuickLaneModalTabs.publication
			);
	}, [isOpen, content, setActiveTab]);

	const getTabs = () => {
		return tabs.filter((tab) => {
			switch (tab.id) {
				case QuickLaneModalTabs.publication:
					return isCollection({ content_label });

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
				return t(
					'shared/components/quick-lane-modal/quick-lane-modal___collectie-is-niet-publiek'
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
											if (isShareable(content)) {
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

					{!isShareable(content) &&
						isCollection({ content_label }) &&
						tab === QuickLaneModalTabs.publication && (
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
