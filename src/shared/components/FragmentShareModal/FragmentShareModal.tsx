import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
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
import { type MenuItemInfoSchema } from '@viaa/avo2-components/src/components/Menu/MenuContent/MenuContent';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import React, { createRef, type FC, type ReactNode, useEffect, useState } from 'react';

import { PermissionService } from '../../../authentication/helpers/permission-service';
import EmbedContent from '../../../embed-code/components/EmbedContent';
import { bookWidgetsLogo, smartSchoolLogo } from '../../../embed-code/embed-code.const';
import {
	type EmbedCode,
	EmbedCodeDescriptionType,
	EmbedCodeExternalWebsite,
} from '../../../embed-code/embed-code.types';
import { toSeconds } from '../../helpers/parsers/duration';
import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';
import withUser, { type UserProps } from '../../hocs/withUser';
import { useTabs } from '../../hooks/useTabs';
import { trackEvents } from '../../services/event-logging-service';
import QuickLaneContent from '../QuickLaneContent/QuickLaneContent';
import { QuickLaneTypeEnum } from '../QuickLaneContent/QuickLaneContent.types';
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
			...(PermissionService.hasPerm(commonUser, PermissionName.EMBED_ITEMS_ON_OTHER_SITES)
				? [
						{
							id: ShareDropdownTabs.EMBED,
							label: (
								<>
									{tText(
										'shared/components/fragment-share-modal/fragment-share-modal___insluiten'
									)}
									<img
										className="append-logo"
										src={smartSchoolLogo}
										alt={tText(
											'shared/components/fragment-share-modal/fragment-share-modal___smartschool-logo'
										)}
									/>
									<img
										className="append-logo"
										src={bookWidgetsLogo}
										alt={tText(
											'shared/components/fragment-share-modal/fragment-share-modal___bookwidgets-logo'
										)}
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
	const [embedDropdownSelection, setEmbedDropdownSelection] = useState<
		EmbedCodeExternalWebsite | ''
	>('');
	const [embedCode, setEmbedCode] = useState<EmbedCode | undefined>(undefined);

	const modalRef = createRef();

	const handleRightsButtonClicked = () => {
		setIsEmbedDropdownOpen(!isEmbedDropdownOpen);
	};

	const handleTabChanged = (id: string | number) => {
		setActiveTab(id);
		if (id === ShareDropdownTabs.EMBED) {
			trackEvents(
				{
					object: item.external_id,
					object_type: 'embed_code',
					action: 'activate',
				},
				commonUser
			);
		}
	};

	useEffect(() => {
		setEmbedDropdownSelection('');
	}, [tab]);

	useEffect(() => {
		if (embedDropdownSelection === '') {
			setEmbedCode(undefined);
		} else {
			setEmbedCode({
				id: '',
				title: item.title,
				externalWebsite: embedDropdownSelection,
				contentType: 'ITEM',
				contentId: item.external_id,
				content: item,
				descriptionType:
					embedDropdownSelection === EmbedCodeExternalWebsite.BOOKWIDGETS
						? EmbedCodeDescriptionType.NONE
						: EmbedCodeDescriptionType.ORIGINAL,
				description:
					embedDropdownSelection === EmbedCodeExternalWebsite.BOOKWIDGETS
						? ''
						: item.description,
				start: 0,
				end: toSeconds(item.duration),
			} as EmbedCode);
		}
	}, [embedDropdownSelection]);

	const embedDropdownOptions: MenuItemInfoSchema[] = [
		{
			label: (
				<>
					<img
						className="o-svg-icon prepend-logo"
						src={smartSchoolLogo}
						alt={tText(
							'shared/components/fragment-share-modal/fragment-share-modal___smartschool-logo'
						)}
					/>
					{tText(
						'shared/components/fragment-share-modal/fragment-share-modal___smartschool'
					)}
				</>
			) as unknown as string, // TODO allow ReactNode in avo2-components
			id: EmbedCodeExternalWebsite.SMARTSCHOOL,
			key: EmbedCodeExternalWebsite.SMARTSCHOOL,
		},
		{
			label: (
				<>
					<img
						className="o-svg-icon prepend-logo"
						src={bookWidgetsLogo}
						alt={tText(
							'shared/components/fragment-share-modal/fragment-share-modal___bookwidgets-logo'
						)}
					/>
					{tText(
						'shared/components/fragment-share-modal/fragment-share-modal___bookwidgets'
					)}
				</>
			) as unknown as string, // TODO allow ReactNode in avo2-components
			id: EmbedCodeExternalWebsite.BOOKWIDGETS,
			key: EmbedCodeExternalWebsite.BOOKWIDGETS,
		},
	];

	const getEmbedDropdownLabel = () => {
		return (
			embedDropdownOptions.find((value) => value.id === embedDropdownSelection)?.label ||
			tText(
				'shared/components/fragment-share-modal/fragment-share-modal___selecteer-een-platform'
			)
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

	const renderEmbedContentDescription = (): string | ReactNode => {
		switch (embedDropdownSelection) {
			case EmbedCodeExternalWebsite.SMARTSCHOOL:
				return tHtml(
					'shared/components/fragment-share-modal/fragment-share-modal___bewerk-het-fragment-kopieer-de-link-en-plak-hem-bij-extra-inhoud-in-een-smartschoolfiche'
				);
			case EmbedCodeExternalWebsite.BOOKWIDGETS:
				return tHtml(
					'shared/components/fragment-share-modal/fragment-share-modal___bewerk-het-fragment-kopieer-de-link-en-plak-hem-in-een-widget-in-bookwidgets'
				);
			default:
				return '';
		}
	};

	const renderEmbedContent = (): ReactNode => {
		return (
			<>
				<Spacer margin="bottom-large">
					<Container
						mode="vertical"
						bordered={!!embedDropdownSelection}
						className="embed-selection"
					>
						<Spacer margin="bottom">
							<BlockHeading type="h4">
								{tHtml(
									'shared/components/fragment-share-modal/fragment-share-modal___fragment-insluiten-in'
								)}
							</BlockHeading>
						</Spacer>
						<Spacer margin="bottom">
							<Dropdown
								label={getEmbedDropdownLabel() as string} // TODO allow ReactNode in avo2-components
								onOpen={handleRightsButtonClicked}
								onClose={handleRightsButtonClicked}
								isOpen={isEmbedDropdownOpen}
							>
								<MenuContent
									menuItems={embedDropdownOptions}
									onClick={(id) => {
										setEmbedDropdownSelection(id as EmbedCodeExternalWebsite);
										handleRightsButtonClicked();
									}}
								/>
							</Dropdown>
						</Spacer>
					</Container>
				</Spacer>
				<EmbedContent
					item={embedCode}
					contentDescription={renderEmbedContentDescription()}
					onClose={handleClose}
					onResize={() => modalRef?.current?.updateSize()}
				/>
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
			ref={modalRef}
			isOpen={isOpen}
			size="large"
			scrollable={tab === ShareDropdownTabs.PUPILS || !!embedDropdownSelection}
			onClose={handleClose}
			disablePageScroll={true}
			title={tHtml(
				'shared/components/fragment-share-modal/fragment-share-modal___deel-dit-fragment'
			)}
		>
			<ModalSubHeader>
				<Spacer className="m-fragment-share-modal__tabs-wrapper" margin={'bottom'}>
					<Tabs tabs={tabs} onClick={handleTabChanged} />
				</Spacer>
			</ModalSubHeader>
			<ModalBody>{renderTabs()}</ModalBody>
			{(!embedDropdownSelection || tab !== ShareDropdownTabs.EMBED) && (
				<ModalFooterLeft>
					<Button
						type="secondary"
						label={tText(
							'shared/components/fragment-share-modal/fragment-share-modal___annuleer'
						)}
						title={tText(
							'shared/components/fragment-share-modal/fragment-share-modal___annuleer'
						)}
						ariaLabel={tText(
							'shared/components/fragment-share-modal/fragment-share-modal___annuleer'
						)}
						onClick={handleClose}
					/>
				</ModalFooterLeft>
			)}
		</Modal>
	);
};

export default withUser(FragmentShareModal) as FC<FragmentShareModalProps>;
