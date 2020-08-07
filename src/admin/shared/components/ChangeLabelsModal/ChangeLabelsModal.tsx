import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Modal,
	ModalBody,
	ModalFooterRight,
	TagInfo,
	TagsInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

import { PickerItem } from '../../types';

interface ChangeLabelsModalProps {
	initialAuthor?: PickerItem;
	isOpen: boolean;
	labels: TagInfo[];
	onClose?: () => void;
	callback: (newLabels: TagInfo[]) => void;
}

const ChangeLabelsModal: FunctionComponent<ChangeLabelsModalProps> = ({
	onClose = () => {},
	isOpen,
	labels,
	callback,
}) => {
	const [t] = useTranslation();

	const [selectedLabels, setSelectedLabels] = useState<TagInfo[]>([]);

	return (
		<Modal
			isOpen={isOpen}
			title={t('Selecteer de nieuwe labels')}
			size="small"
			onClose={onClose}
		>
			<ModalBody>
				<TagsInput options={labels} value={selectedLabels} onChange={setSelectedLabels} />
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
										callback(selectedLabels);
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

export default ChangeLabelsModal;
