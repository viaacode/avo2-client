import { Modal, ModalBody } from '@viaa/avo2-components';
import { format, subMilliseconds } from 'date-fns';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { matchPath } from 'react-router';

import {
	EDIT_STATUS_REFETCH_TIME,
	IDLE_TIME_UNTIL_WARNING,
	MAX_EDIT_IDLE_TIME,
} from '../../constants';
import { tHtml } from '../../helpers/translate';
import { useBeforeUnload } from '../../hooks';

type InActivityWarningModalProps = {
	onActivity: () => void;
	onExit: () => void;
	warningMessage: string | ReactNode;
	editPath: string;
	currentPath: string;
};

const InActivityWarningModal: FC<InActivityWarningModalProps> = ({
	onActivity,
	onExit,
	warningMessage,
	editPath,
	currentPath,
}) => {
	const initialCount = new Date(MAX_EDIT_IDLE_TIME);
	const [idleTime, setIdleTime] = useState<Date>(initialCount);
	const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);

	useBeforeUnload(() => {
		onExit();
	});

	useEffect(() => {
		const changingRoute = !matchPath(currentPath, editPath);
		if (changingRoute) {
			console.log('changingroute');
			onExit();
		}
	}, [currentPath]);

	useEffect(() => {
		return () => onExit();
	}, []);

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
