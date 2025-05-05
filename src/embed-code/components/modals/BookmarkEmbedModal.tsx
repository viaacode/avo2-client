import { Modal, ModalBody, ModalSubHeader, Spacer, Tabs } from '@viaa/avo2-components';
import React, { type FC, type ReactNode, useEffect } from 'react';

import EmbedContent from '../../../embed-code/components/EmbedContent';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { useTabs } from '../../../shared/hooks/useTabs';
import { bookWidgetsLogo, smartSchoolLogo } from '../../embed-code.const';
import { type EmbedCode, EmbedCodeExternalWebsite } from '../../embed-code.types';

import './BookmarkEmbedModal.scss';

type BookmarkEmbedModalProps = {
	embedCode: EmbedCode | null;
	isOpen: boolean;
	onClose: () => void;
};

const BookmarkEmbedModal: FC<BookmarkEmbedModalProps> = ({ embedCode, isOpen, onClose }) => {
	const initialTab = EmbedCodeExternalWebsite.SMARTSCHOOL;
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: EmbedCodeExternalWebsite.SMARTSCHOOL,
				label: (
					<>
						<img
							className="o-svg-icon prepend-logo"
							src={smartSchoolLogo}
							alt={tText('Smartschool logo')}
						/>
						{tText('Smartschool')}
					</>
				),
			},
			{
				id: EmbedCodeExternalWebsite.BOOKWIDGETS,
				label: (
					<>
						<img
							className="o-svg-icon prepend-logo"
							src={bookWidgetsLogo}
							alt={tText('Bookwidgets logo')}
						/>
						{tText('Bookwidgets')}
					</>
				),
			},
		],
		initialTab
	);

	useEffect(() => {
		setActiveTab(embedCode?.externalWebsite || initialTab);
	}, [embedCode]);

	const handleClose = () => {
		onClose && onClose();
		setActiveTab(initialTab);
	};

	const renderTabs = (): ReactNode => {
		if (!embedCode) {
			return <></>;
		}

		switch (tab) {
			case EmbedCodeExternalWebsite.SMARTSCHOOL:
				return (
					<EmbedContent
						item={
							{
								...embedCode,
								externalWebsite: EmbedCodeExternalWebsite.SMARTSCHOOL,
							} as EmbedCode
						}
						contentDescription="Bewerk het fragment, kopieer de link en plak hem bij Extra Inhoud in een Smartschoolfiche."
						onClose={handleClose}
					/>
				);
			case EmbedCodeExternalWebsite.BOOKWIDGETS:
				return (
					<EmbedContent
						item={
							{
								...embedCode,
								externalWebsite: EmbedCodeExternalWebsite.BOOKWIDGETS,
							} as EmbedCode
						}
						contentDescription="Bewerk het fragment, kopieer de link en plak hem bij Extra Inhoud in Bookwidgets."
						onClose={handleClose}
					/>
				);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			size="large"
			scrollable={true}
			onClose={handleClose}
			disablePageScroll={true}
			title={tHtml('Deel dit fragment')}
		>
			<ModalSubHeader>
				<Spacer className="m-bookmarks-embed-modal__tabs-wrapper" margin={'bottom'}>
					<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />
				</Spacer>
			</ModalSubHeader>
			<ModalBody>{renderTabs()}</ModalBody>
		</Modal>
	);
};

export default BookmarkEmbedModal as FC<BookmarkEmbedModalProps>;
