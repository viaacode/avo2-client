import { Button, ButtonProps } from '@viaa/avo2-components';
import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DraggableBlock from '../components/DraggableBlock/DraggableBlock';
import DraggableListModal, {
	DraggableListModalProps,
} from '../components/DraggableList/DraggableListModal';

export function useDraggableListModal(config?: {
	button?: Partial<ButtonProps>;
	modal?: Partial<DraggableListModalProps>;
}): [ReactNode, ReactNode] {
	const [t] = useTranslation();
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const button = (
		<Button
			icon="shuffle"
			{...config?.button}
			type="secondary"
			label={t('collection/components/collection-or-bundle-edit___herorden-fragmenten')}
			title={t(
				'collection/components/collection-or-bundle-edit___herorden-de-fragmenten-via-drag-and-drop'
			)}
			onClick={(e) => {
				setIsOpen(true);
				config?.button?.onClick?.(e);
			}}
		/>
	);

	const modal = (
		<DraggableListModal
			{...config?.modal}
			renderItem={(item) => <DraggableBlock block={item} />}
			isOpen={isOpen}
			onClose={(update?: any[]) => {
				setIsOpen(false);
				config?.modal?.onClose?.(update);
			}}
		/>
	);

	return [button, modal];
}
