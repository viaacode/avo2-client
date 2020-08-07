import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Modal,
	ModalBody,
	ModalFooterRight,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

import { PickerItem } from '../../types';
import { ContentPicker } from '../ContentPicker/ContentPicker';

interface ChangeAuthorModalProps {
	initialAuthor?: PickerItem;
	isOpen: boolean;
	onClose?: () => void;
	callback: (authorProfileId: PickerItem) => void;
}

const ChangeAuthorModal: FunctionComponent<ChangeAuthorModalProps> = ({
	onClose = () => {},
	isOpen,
	initialAuthor,
	callback,
}) => {
	const [t] = useTranslation();

	const [author, setAuthor] = useState<PickerItem | undefined>();

	return (
		<Modal isOpen={isOpen} title={t('Selecteer een auteur')} size="small" onClose={onClose}>
			<ModalBody>
				<ContentPicker
					initialValue={initialAuthor || undefined}
					hideTargetSwitch
					hideTypeDropdown
					placeholder={t('Selecteer een auteur')}
					allowedTypes={['PROFILE']}
					onSelect={(newAuthor: PickerItem | null) => {
						setAuthor(newAuthor || undefined);
					}}
				/>
			</ModalBody>
			<ModalFooterRight>
				<Toolbar>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button type="secondary" label={t('Annuleren')} onClick={onClose} />
								<Button
									type="primary"
									label={t('Toepassen')}
									onClick={() => {
										onClose();
										if (author) {
											callback(author);
										}
									}}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalFooterRight>
		</Modal>
	);
};

export default ChangeAuthorModal;
