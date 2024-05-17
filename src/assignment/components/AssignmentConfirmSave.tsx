import { type DefaultProps } from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { type FC, type ReactNode } from 'react';

import ConfirmModal, {
	type ConfirmModalProps,
} from '../../shared/components/ConfirmModal/ConfirmModal';
import useTranslation from '../../shared/hooks/useTranslation';

type AssignmentConfirmSaveProps = DefaultProps & {
	hasBlocks?: boolean;
	hasResponses?: boolean;
	modal?: Partial<ConfirmModalProps>;
};

const AssignmentConfirmSave: FC<AssignmentConfirmSaveProps> = ({
	hasBlocks,
	hasResponses,
	modal,
}) => {
	const { tText, tHtml } = useTranslation();

	let bodyHtml: ReactNode = tHtml(
		'assignment/components/assignment-confirm-save___weet-je-zeker-dat-je-de-wijzigingen-wil-opslaan'
	);

	if (hasBlocks) {
		bodyHtml = tHtml(
			'assignment/views/assignment-edit___waarschuwing-leerlingencollecties-bestaan-reeds-verwijderen'
		);
	} else if (hasResponses) {
		bodyHtml = tHtml(
			'assignment/views/assignment-edit___waarschuwing-leerlingen-reeds-bekeken'
		);
	}

	return (
		<ConfirmModal
			isOpen={modal?.isOpen || false}
			body={bodyHtml}
			onClose={modal?.onClose || noop}
			confirmCallback={modal?.confirmCallback || noop}
			cancelLabel={tText('assignment/views/assignment-edit___annuleer')}
			confirmLabel={tText('assignment/views/assignment-edit___opslaan')}
			title={tHtml('assignment/views/assignment-edit___nieuwe-wijzigingen-opslaan')}
			confirmButtonType="primary"
		/>
	);
};

export default AssignmentConfirmSave;
