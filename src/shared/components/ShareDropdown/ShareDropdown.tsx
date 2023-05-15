import { Dropdown, DropdownButton, DropdownContent } from '@meemoo/react-components';
import { Button, IconName, MenuContent, Tabs, TextInput } from '@viaa/avo2-components';
import React, { FC, useState } from 'react';

import { useTabs } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import './ShareDropdown.scss';

type ShareDropdownProps = {
	// onAddNewUser: () => void;
	// onEditRights: () => void;
	// onDeleteUser: () => void;
};

export const ShareDropdown: FC<ShareDropdownProps> = () => {
	const { tText } = useTranslation();

	const [isShareDropdownOpen, setIsShareDropdownOpen] = useState<boolean>(false);
	const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: 'colleagues',
				label: tText("collega's"),
				icon: IconName.userTeacher,
			},
			{ id: 'pupils', label: tText('leerlingen'), icon: IconName.userStudent },
		],
		'colleagues'
	);

	const handleShareButtonClicked = () => {
		setIsShareDropdownOpen(!isShareDropdownOpen);
	};

	const handleRoleButtonClicked = () => {
		setIsRoleDropdownOpen(!isRoleDropdownOpen);
	};

	return (
		<Dropdown isOpen={isShareDropdownOpen} className="c-share-dropdown">
			<DropdownButton>
				<Button
					ariaLabel={tText('Delen')}
					label={tText('Delen')}
					title={tText(
						'assignment/components/share-assignment-with-pupil___bezorg-deze-opdrachtlink-aan-je-leerlingen'
					)}
					onClick={handleShareButtonClicked}
					disabled={false}
				/>
			</DropdownButton>

			<DropdownContent>
				<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />

				<div className="c-share-dropdown__content">
					{tab === 'colleagues' ? (
						<>
							<div className="c-add-colleague">
								<TextInput type="email" className="c-add-colleague__input" />

								<Dropdown isOpen={isRoleDropdownOpen}>
									<DropdownButton>
										<Button
											icon={
												isRoleDropdownOpen
													? IconName.caretUp
													: IconName.caretDown
											}
											iconPosition="right"
											onClick={handleRoleButtonClicked}
											label={tText('Rol')}
											className="c-add-colleague__select"
										/>
									</DropdownButton>

									<DropdownContent>
										<MenuContent
											menuItems={[
												{ label: tText('Bijdrager'), id: 'contributor' },
												{ label: tText('Kijker'), id: 'viewer' },
											]}
											onClick={(id) => console.log(id)}
										/>
									</DropdownContent>
								</Dropdown>

								<Button icon={IconName.add} label={tText('Voeg toe')} />
							</div>
						</>
					) : (
						'leerlingen'
					)}
				</div>
			</DropdownContent>
		</Dropdown>
	);
};
