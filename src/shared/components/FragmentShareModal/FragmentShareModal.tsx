import { IconName, Modal, ModalBody, Spacer, Tabs } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, type ReactNode } from 'react';

import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';
import { useTabs } from '../../hooks/useTabs';
import QuickLaneContent from '../QuickLaneContent/QuickLaneContent';
import { ShareDropdownTabs } from '../ShareDropdown/ShareDropdown.types';
import ShareThroughEmailContent from '../ShareThroughEmailContent/ShareThroughEmailContent';
import { type ShareWithPupilsProps } from '../ShareWithPupils/ShareWithPupils';
import './FragmentShareModal.scss';

type FragmentShareModalProps = {
	item: Avo.Item.Item;
	isOpen: boolean;
	onClose: () => void;
	shareWithPupilsProps?: ShareWithPupilsProps;
	withPupils?: boolean;
};

const FragmentShareModal: FC<FragmentShareModalProps> = ({
	item,
	isOpen,
	onClose,
	withPupils = true,
}) => {
	const initialTab = ShareDropdownTabs.COLLEAGUES;
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: ShareDropdownTabs.COLLEAGUES,
				label: tText('shared/components/share-dropdown/share-dropdown___collegas'),
				icon: IconName.userTeacher,
			},
			...(withPupils
				? [
						{
							id: ShareDropdownTabs.PUPILS,
							label: tText(
								'shared/components/share-dropdown/share-dropdown___leerlingen'
							),
							icon: IconName.userStudent,
						},
				  ]
				: []),
		],
		initialTab
	);

	const renderPupilsContent = (): ReactNode => {
		return <QuickLaneContent content={item} content_label="ITEM" isOpen={isOpen} />;
	};

	const renderColleaguesContent = (): ReactNode => {
		return (
			<ShareThroughEmailContent
				emailLinkHref={window.location.href}
				emailLinkTitle={item.title}
				type="item"
				onSendMail={handleClose}
			/>
		);
	};

	const handleClose = () => {
		onClose && onClose();
		setActiveTab(initialTab);
	};

	return (
		<Modal
			isOpen={isOpen}
			size="medium"
			scrollable={true}
			onClose={handleClose}
			title={tHtml('Fragment delen')}
		>
			<ModalBody>
				{
					<>
						<Spacer className="m-fragment-share-modal__tabs-wrapper" margin={'bottom'}>
							<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />
						</Spacer>

						{tab === ShareDropdownTabs.PUPILS
							? renderPupilsContent()
							: renderColleaguesContent()}
					</>
				}
			</ModalBody>
		</Modal>
	);
};

export default FragmentShareModal;
