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
		'collection/components/collection-or-bundle-edit___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
	);

	if (hasBlocks) {
		body = t(
			'assignment/views/assignment-edit___opgelet-er-bestaan-reeds-leerlingencollecties-binnen-deze-opdracht-ben-je-zeker-dat-je-deze-nieuwe-wijzigingen-wil-opslaan-en-de-leerlingencollecties-wil-verwijderen-voor-je-de-pagina-verlaat'
		);
	} else if (hasResponses) {
		body = t(
			'assignment/views/assignment-edit___opgelet-leerlingen-hebben-deze-opdracht-reeds-bekeken-ben-je-zeker-dat-je-deze-nieuwe-wijzigingen-wil-opslaan-voor-je-de-pagina-verlaat'
		);
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
