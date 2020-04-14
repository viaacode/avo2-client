import React, { FunctionComponent, ReactNode, useState } from 'react';

import { Button, ButtonToolbar, Modal, ModalBody, ModalFooterRight } from '@viaa/avo2-components';
import { useTranslation } from 'react-i18next';
import DraggableList from './DraggableList';

export interface DraggableListModalProps {
	items: any[];
	renderItem: (item: any) => ReactNode;
	isOpen: boolean;
	onClose: (elements?: any[]) => void;
	size?: 'small' | 'medium' | 'large' | 'extra-large' | 'fullscreen' | 'fullwidth' | 'auto';
}

const DraggableListModal: FunctionComponent<DraggableListModalProps> = ({
	items,
	renderItem,
	isOpen,
	onClose,
	size = 'medium',
}) => {
	const [t] = useTranslation();

	const [reorderedElements, setReorderedElements] = useState<any[]>(items);

	return (
		<Modal
			title={t('shared/components/draggable-list/draggable-list-modal___herschik-items')}
			isOpen={isOpen}
			size={size}
			scrollable
			onClose={onClose}
		>
			<ModalBody>
				<DraggableList
					items={reorderedElements}
					renderItem={renderItem}
					onListChange={setReorderedElements}
				/>
			</ModalBody>
			<ModalFooterRight>
				<ButtonToolbar>
					<Button
						label={t(
							'shared/components/draggable-list/draggable-list-modal___annuleer'
						)}
						type="secondary"
						onClick={() => onClose()}
					/>
					<Button
						label={t('shared/components/draggable-list/draggable-list-modal___opslaan')}
						type="primary"
						onClick={() => onClose(reorderedElements)}
					/>
				</ButtonToolbar>
			</ModalFooterRight>
		</Modal>
	);
};

export default DraggableListModal;
