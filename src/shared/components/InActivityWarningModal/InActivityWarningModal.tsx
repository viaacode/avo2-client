import { Modal, ModalBody } from '@viaa/avo2-components';
import { format, subMilliseconds } from 'date-fns';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

import {
	EDIT_STATUS_REFETCH_TIME,
	IDLE_TIME_UNTIL_WARNING,
	MAX_EDIT_IDLE_TIME,
} from '../../constants';
import { tHtml } from '../../helpers/translate';

type InActivityWarningModalProps = {
	onActivity: () => void;
	warningMessage: string | ReactNode;
};

const InActivityWarningModal: FC<InActivityWarningModalProps> = ({
	onActivity,
	warningMessage,
}) => {
	const initialCount = new Date(MAX_EDIT_IDLE_TIME);
	const [idleTime, setIdleTime] = useState<Date>(initialCount);
	const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);

	const onAction = () => {
		onActivity();
		setIsWarningModalOpen(false);
		setIdleTime(initialCount);
		reset();
	};

	const { getIdleTime, isIdle, reset } = useIdleTimer({
		onAction,
		onIdle: () => setIsWarningModalOpen(true),
		throttle: EDIT_STATUS_REFETCH_TIME,
		timeout: IDLE_TIME_UNTIL_WARNING,
	});

	useEffect(() => {
		if (isIdle()) {
			const interval = setInterval(() => {
				const millisLeft = subMilliseconds(MAX_EDIT_IDLE_TIME, getIdleTime());
				setIdleTime(millisLeft);
			}, 1000);

			return () => {
				clearInterval(interval);
			};
		}
	});

	return (
		<Modal isOpen={isWarningModalOpen} title={tHtml('Opgelet!')} size="medium">
			<ModalBody>
				<p>{format(new Date(idleTime), 'mm:ss')}</p>

				{warningMessage}
			</ModalBody>
		</Modal>
	);
};

export default InActivityWarningModal;
