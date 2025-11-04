import { Button, ButtonToolbar, Modal, ModalBody, ModalFooterRight } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { type FC, type ReactNode, useState } from 'react';

import { DraggableList } from './DraggableList';

import './DraggableListModal.scss';
import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';

export interface DraggableListModalProps {
	items?: any[];
	renderItem: (item: any) => ReactNode;
	isOpen: boolean;
	onClose: (elements?: any[]) => void;
	size?: 'small' | 'medium' | 'large' | 'extra-large' | 'fullscreen' | 'fullwidth' | 'auto';
}

export const DraggableListModal: FC<DraggableListModalProps> = ({
	items = [],
	renderItem,
	isOpen,
	onClose,
	size = 'medium',
}) => {
	const [reorderedElements, setReorderedElements] = useState<any[] | null>(null);

	const getFragmentKey = (fragment: Avo.Collection.Fragment) => {
		return `fragment_${fragment.id}-${get(fragment, 'created_at')}-${get(
			fragment,
			'position'
		)}`;
	};

	return (
		<Modal
			title={tHtml('shared/components/draggable-list/draggable-list-modal___herschik-items')}
			isOpen={isOpen}
			size={size}
			scrollable
			onClose={onClose}
			className="c-draggable-list-modal"
		>
			<ModalBody>
				<DraggableList
					items={reorderedElements || items}
					renderItem={renderItem}
					onListChange={setReorderedElements}
					generateKey={getFragmentKey}
				/>
			</ModalBody>
			<ModalFooterRight>
				<ButtonToolbar>
					<Button
						label={tText(
							'shared/components/draggable-list/draggable-list-modal___annuleer'
						)}
						type="secondary"
						onClick={() => onClose()}
					/>
					<Button
						label={tText(
							'shared/components/draggable-list/draggable-list-modal___opslaan'
						)}
						type="primary"
						onClick={() => {
							onClose(reorderedElements || items);
							setReorderedElements(null);
						}}
					/>
				</ButtonToolbar>
			</ModalFooterRight>
		</Modal>
	);
};
