import bookwidgetLogo from '@assets/images/bookwidget_logo.png';
import smartschoolLogo from '@assets/images/smartschool_logo.png';
import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Alert,
	Button,
	Container,
	Dropdown,
	IconName,
	MenuContent,
	Modal,
	ModalBody,
	ModalFooterLeft,
	ModalSubHeader,
	Spacer,
	Tabs,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import React, { type FC, type ReactNode, useState } from 'react';

import { PermissionService } from '../../../authentication/helpers/permission-service';
import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';
import withUser, { type UserProps } from '../../hocs/withUser';
import { useTabs } from '../../hooks/useTabs';
import QuickLaneContent from '../QuickLaneContent/QuickLaneContent';
import { QuickLaneTypeEnum } from '../QuickLaneContent/QuickLaneContent.types';
import { ShareDropdownTabs } from '../ShareDropdown/ShareDropdown.types';
import ShareThroughEmailContent from '../ShareThroughEmailContent/ShareThroughEmailContent';
import { type ShareWithPupilsProps } from '../ShareWithPupils/ShareWithPupils';

import './FragmentShareModal.scss';
import EmbedContent from './EmbedContent';
import { FragmentShareEmbedOptions } from './FragmentShareModal.types';

type FragmentShareModalProps = {
	item: Avo.Item.Item;
	isOpen: boolean;
	onClose: () => void;
	shareWithPupilsProps?: ShareWithPupilsProps;
	withPupils?: boolean;
};

const FragmentShareModal: FC<FragmentShareModalProps & UserProps> = ({
	item,
	isOpen,
	onClose,
	commonUser,
}) => {
	const initialTab = ShareDropdownTabs.COLLEAGUES;
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: ShareDropdownTabs.COLLEAGUES,
				label: tText('shared/components/share-dropdown/share-dropdown___collegas'),
				icon: IconName.userTeacher,
			},
			...(PermissionService.hasPerm(commonUser, PermissionName.CREATE_QUICK_LANE)
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
			// TODO: inverse this again so it excludes correctly
			...(!PermissionService.hasPerm(commonUser, PermissionName.EMBED_ITEMS_ON_OTHER_SITES)
				? [
						{
							id: ShareDropdownTabs.EMBED,
							label: (
								<>
									{tText('Insluiten')}
									<img
										className="append-logo"
										src={smartschoolLogo}
										alt={tText('Smartschool logo')}
									/>
									<img
										className="append-logo"
										src={bookwidgetLogo}
										alt={tText('Bookwidget logo')}
									/>
								</>
							),
							icon: IconName.code,
						},
				  ]
				: []),
		],
		initialTab
	);
	const [isEmbedDropdownOpen, setIsEmbedDropdownOpen] = useState<boolean>(false);
	const [embedDropdownSelection, setEmbedDropdownSelection] = useState<string>('');

	const handleRightsButtonClicked = () => {
		setIsEmbedDropdownOpen(!isEmbedDropdownOpen);
	};

	const embedDropdownOptions = [
		{
			label: (
				<>
					<img
						className="o-svg-icon prepend-logo"
						src={smartschoolLogo}
						alt={tText('Smartschool logo')}
					/>
					{tText('Smartschool')}
				</>
			),
			id: FragmentShareEmbedOptions.SMARTSCHOOL,
			key: FragmentShareEmbedOptions.SMARTSCHOOL,
		},
		{
			label: (
				<>
					<img
						className="o-svg-icon prepend-logo"
						src={bookwidgetLogo}
						alt={tText('Bookwidget logo')}
					/>
					{tText('Bookwidget')}
				</>
			),
			id: FragmentShareEmbedOptions.BOOKWIDGET,
			key: FragmentShareEmbedOptions.BOOKWIDGET,
		},
	];

	const getEmbedDropdownLabel = () => {
		return (
			embedDropdownOptions.find((value) => value.id === embedDropdownSelection)?.label ||
			tText('Selecteer een platform')
		);
	};

	const handleClose = () => {
		onClose && onClose();
		setActiveTab(initialTab);
		setEmbedDropdownSelection('');
	};

	const renderPupilsContent = (): ReactNode => {
		return (
			<QuickLaneContent
				content={item}
				content_label={QuickLaneTypeEnum.ITEM}
				isOpen={isOpen}
			/>
		);
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

	const renderEmbedContent = (): ReactNode => {
		let embedDetail: ReactNode | string = '';
		let customDescription: ReactNode | undefined = undefined;

		if (embedDropdownSelection === FragmentShareEmbedOptions.SMARTSCHOOL) {
			embedDetail = tHtml(
				'Bewerk het fragment, kopieer de link en plak hem bij Extra Inhoud in een Smartschoolfiche.'
			);
		} else if (embedDropdownSelection === FragmentShareEmbedOptions.BOOKWIDGET) {
			embedDetail = tHtml(
				'Bewerk het fragment, kopieer de link en plak hem bij Extra Inhoud in Bookwidgets.'
			);
			customDescription = (
				<Alert type="info">
					<span className="c-content">
						{tHtml(
							'Bij het insluiten op Bookwidgets wordt er geen beschrijving bij het fragment weergegeven.'
						)}
					</span>
				</Alert>
			);
		}

		return (
			<>
				<Container
					mode="vertical"
					bordered={!!embedDropdownSelection}
					className="embed-selection"
				>
					<Spacer margin="bottom">
						<BlockHeading type="h4">{tHtml('Fragment insluiten in')}</BlockHeading>
					</Spacer>
					<Spacer margin="bottom">
						<Dropdown
							label={getEmbedDropdownLabel()}
							onOpen={handleRightsButtonClicked}
							onClose={handleRightsButtonClicked}
							isOpen={isEmbedDropdownOpen}
						>
							<MenuContent
								menuItems={embedDropdownOptions}
								onClick={(id) => {
									setEmbedDropdownSelection(id as string);
									handleRightsButtonClicked();
								}}
							/>
						</Dropdown>
					</Spacer>
				</Container>
				{embedDetail && <Spacer margin="top-large">{embedDetail}</Spacer>}
				{embedDropdownSelection && (
					<EmbedContent
						item={item}
						customDescription={customDescription}
						onClose={handleClose}
					/>
				)}
			</>
		);
	};

	const renderTabs = (): ReactNode => {
		switch (tab) {
			case ShareDropdownTabs.COLLEAGUES:
				return renderColleaguesContent();
			case ShareDropdownTabs.PUPILS:
				return renderPupilsContent();
			case ShareDropdownTabs.EMBED:
				return renderEmbedContent();
			default:
				return <></>;
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			size="large"
			scrollable={tab === ShareDropdownTabs.PUPILS || !!embedDropdownSelection}
			onClose={handleClose}
			disablePageScroll={true}
			title={tHtml('Deel dit fragment')}
		>
			<ModalSubHeader>
				<Spacer className="m-fragment-share-modal__tabs-wrapper" margin={'bottom'}>
					<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />
				</Spacer>
			</ModalSubHeader>
			<ModalBody>{renderTabs()}</ModalBody>
			{(!embedDropdownSelection || tab !== ShareDropdownTabs.EMBED) && (
				<ModalFooterLeft>
					<Button
						type="secondary"
						label={tText('Annuleer')}
						title={tText('Annuleer')}
						ariaLabel={tText('Annuleer')}
						onClick={handleClose}
					/>
				</ModalFooterLeft>
			)}
		</Modal>
	);
};

export default withUser(FragmentShareModal) as FC<FragmentShareModalProps>;
