import { DefaultProps } from '@viaa/avo2-components';
import React, { FC } from 'react';
import BeforeUnloadComponent from 'react-beforeunload-component';
import { useTranslation } from 'react-i18next';

import ConfirmModal, { ConfirmModalProps } from '../../shared/components/ConfirmModal/ConfirmModal';

type AssignmentUnloadProps = DefaultProps & { blockRoute?: boolean } & {
	hasBlocks?: boolean;
	hasResponses?: boolean;
	modal?: Partial<ConfirmModalProps>;
};

const AssignmentUnload: FC<AssignmentUnloadProps> = ({
	blockRoute,
	children,
	hasBlocks,
	hasResponses,
	modal,
}) => {
	const [t] = useTranslation();

	return (
		<BeforeUnloadComponent
			blockRoute={blockRoute}
			modalComponentHandler={({
				handleModalLeave: confirm,
				handleModalCancel: cancel,
			}: {
				handleModalLeave: () => void;
				handleModalCancel: () => void;
			}) => {
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
						isOpen={true}
						body={body}
						onClose={cancel}
						deleteObjectCallback={() => {
							const callback = modal?.deleteObjectCallback;
							callback && callback();

							confirm();
						}}
						cancelLabel={t('assignment/components/assignment-unload___blijven')}
						confirmLabel={t('assignment/components/assignment-unload___verlaten')}
						title={t('assignment/views/assignment-edit___nieuwe-wijzigingen-opslaan')}
						confirmButtonType="primary"
					/>
				);
			}}
		>
			{children}
		</BeforeUnloadComponent>
	);
};

export default AssignmentUnload;
