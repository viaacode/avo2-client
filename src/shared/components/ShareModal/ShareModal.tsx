import { IconName, Modal, ModalBody, Spacer, Tabs } from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import React, { FC, useEffect, useState } from 'react';

import { tText } from '../../helpers/translate';
import { useTabs } from '../../hooks';
import { ShareDropdownTabs } from '../ShareDropdown/ShareDropdown.types';
import ShareWithColleagues from '../ShareWithColleagues/ShareWithColleagues';
import {
	ContributorInfo,
	ContributorInfoRights,
} from '../ShareWithColleagues/ShareWithColleagues.types';
import { ShareWithPupil, ShareWithPupilsProps } from '../ShareWithPupils/ShareWithPupils';
import './ShareModal.scss';

type ShareModalProps = {
	title: string;
	isOpen: boolean;
	contributors?: ContributorInfo[];
	onClose: () => void;
	onAddContributor: (info: Partial<ContributorInfo>) => Promise<void>;
	onEditContributorRights: (
		info: ContributorInfo,
		newRights: ContributorInfoRights
	) => Promise<void>;
	onDeleteContributor: (info: ContributorInfo) => Promise<void>;
	shareWithPupilsProps?: ShareWithPupilsProps;
	withPupils?: boolean;
	availableRights: {
		[ContributorInfoRights.CONTRIBUTOR]: PermissionName;
		[ContributorInfoRights.VIEWER]: PermissionName;
	};
	isAdmin: boolean;
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
	availableRights,
	isAdmin,
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
		withPupils ? ShareDropdownTabs.PUPILS : ShareDropdownTabs.COLLEAGUES
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

	return (
		<Modal isOpen={isModalOpen} onClose={handleOnClose} title={title}>
			<ModalBody>
				{
					<>
						<Tabs
							tabs={tabs}
							onClick={(id) => setActiveTab(id)}
							className={'c-share-modal__tabs'}
						/>

						{tab === ShareDropdownTabs.COLLEAGUES ? (
							<Spacer margin={'top-large'}>
								<ShareWithColleagues
									contributors={contributors || []}
									availableRights={availableRights}
									onAddNewContributor={onAddContributor}
									onDeleteContributor={onDeleteContributor}
									onEditRights={onEditContributorRights}
									hasModalOpen={(open: boolean) => setHasModalOpen(open)}
									isAdmin={isAdmin}
								/>
							</Spacer>
						) : (
							<Spacer margin={'top-large'}>
								<ShareWithPupil
									{...(shareWithPupilsProps as ShareWithPupilsProps)}
								/>
							</Spacer>
						)}
					</>
				}
			</ModalBody>
		</Modal>
	);
};

export default ShareModal;
