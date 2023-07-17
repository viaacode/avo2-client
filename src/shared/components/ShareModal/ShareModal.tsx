import { IconName, Modal, ModalBody, Spacer, Tabs } from '@viaa/avo2-components';
import React, { FC, useEffect, useState } from 'react';

import { tText } from '../../helpers/translate';
import { useTabs } from '../../hooks';
import { ShareDropdownTabs } from '../ShareDropdown/ShareDropdown.types';
import ShareWithColleagues from '../ShareWithColleagues/ShareWithColleagues';
import { ContributorInfo, ShareRightsType } from '../ShareWithColleagues/ShareWithColleagues.types';
import { ShareWithPupil, ShareWithPupilsProps } from '../ShareWithPupils/ShareWithPupils';
import './ShareModal.scss';

type ShareModalProps = {
	title: string;
	isOpen: boolean;
	contributors?: ContributorInfo[];
	onClose: () => void;
	onAddContributor: (info: Partial<ContributorInfo>) => void;
	onEditContributorRights: (info: ContributorInfo, newRights: ShareRightsType) => void;
	onDeleteContributor: (info: ContributorInfo) => void;
	shareWithPupilsProps?: ShareWithPupilsProps;
	withPupils?: boolean;
};

const ShareModal: FC<ShareModalProps> = ({
	title,
	isOpen,
	onClose,
	contributors,
	onAddContributor,
	onEditContributorRights,
	onDeleteContributor,
	shareWithPupilsProps,
	withPupils = true,
}) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [hasModalOpen, setHasModalOpen] = useState<boolean>(false);

	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: ShareDropdownTabs.COLLEAGUES,
				label: tText('shared/components/share-dropdown/share-dropdown___collegas'),
				icon: IconName.userTeacher,
			},
			{
				id: ShareDropdownTabs.PUPILS,
				label: tText('shared/components/share-dropdown/share-dropdown___leerlingen'),
				icon: IconName.userStudent,
			},
		],
		ShareDropdownTabs.PUPILS
	);

	useEffect(() => {
		if (!hasModalOpen) {
			setIsModalOpen(isOpen);
		} else {
			setIsModalOpen(false);
		}
	}, [isOpen, hasModalOpen]);

	const handleOnClose = () => {
		if (!hasModalOpen) {
			onClose();
		}
	};

	const renderShareWithColleagues = () => {
		if (contributors) {
			return (
				<Spacer margin={'top-large'}>
					<ShareWithColleagues
						contributors={contributors}
						onAddNewContributor={onAddContributor}
						onDeleteContributor={onDeleteContributor}
						onEditRights={onEditContributorRights}
						hasModalOpen={(open: boolean) => setHasModalOpen(open)}
					/>
				</Spacer>
			);
		}
	};

	return (
		<Modal isOpen={isModalOpen} onClose={handleOnClose} title={title}>
			<ModalBody>
				{withPupils ? (
					<>
						<Tabs
							tabs={tabs}
							onClick={(id) => setActiveTab(id)}
							className={'c-share-modal__tabs'}
						/>

						{tab === ShareDropdownTabs.COLLEAGUES ? (
							<>{contributors && renderShareWithColleagues()}</>
						) : (
							<Spacer margin={'top-large'}>
								<ShareWithPupil
									{...(shareWithPupilsProps as ShareWithPupilsProps)}
								/>
							</Spacer>
						)}
					</>
				) : (
					renderShareWithColleagues()
				)}
			</ModalBody>
		</Modal>
	);
};

export default ShareModal;
