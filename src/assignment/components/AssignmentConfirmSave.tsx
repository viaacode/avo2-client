import { DefaultProps } from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import ConfirmModal, { ConfirmModalProps } from '../../shared/components/ConfirmModal/ConfirmModal';

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
	const [t] = useTranslation();

	let body = t(
		'assignment/components/assignment-confirm-save___weet-je-zeker-dat-je-de-wijzigingen-wil-opslaan'
	);

	if (hasBlocks) {
		body = t(
			'assignment/views/assignment-edit___waarschuwing-leerlingencollecties-bestaan-reeds-verwijderen'
		);
	} else if (hasResponses) {
		body = t('assignment/views/assignment-edit___waarschuwing-leerlingen-reeds-bekeken');
	}

	return (
		<ConfirmModal
			isOpen={modal?.isOpen || false}
			body={body}
			onClose={modal?.onClose || noop}
			confirmCallback={modal?.confirmCallback || noop}
			cancelLabel={t('assignment/views/assignment-edit___annuleer')}
			confirmLabel={t('assignment/views/assignment-edit___opslaan')}
			title={t('assignment/views/assignment-edit___nieuwe-wijzigingen-opslaan')}
			confirmButtonType="primary"
		/>
	);
};

export default AssignmentConfirmSave;