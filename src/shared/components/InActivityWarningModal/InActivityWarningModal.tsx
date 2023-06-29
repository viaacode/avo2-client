import { Modal, ModalBody } from '@viaa/avo2-components';
import { differenceInSeconds, format } from 'date-fns';
import { once } from 'lodash';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { matchPath } from 'react-router';

import {
	EDIT_STATUS_REFETCH_TIME,
	// IDLE_TIME_UNTIL_WARNING,
	// MAX_EDIT_IDLE_TIME,
} from '../../constants';
import { tHtml } from '../../helpers/translate';
import { useBeforeUnload } from '../../hooks';

type InActivityWarningModalProps = {
	onActivity: () => void;
	onExit: (location: string) => void;
	onForcedExit: () => void;
	warningMessage: string | ReactNode;
	editPath: string;
	currentPath: string;
};

const InActivityWarningModal: FC<InActivityWarningModalProps> = ({
	onActivity,
	onExit,
	onForcedExit,
	warningMessage,
	editPath,
	currentPath,
}) => {
	const maxIdleTime = 5;
	const initialTime = 5;
	const [remainingTime, setRemainingTime] = useState<number>(initialTime);
	const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);
	const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
	const [idleStart, setIdleStart] = useState<Date | null>(null);
	const forceExitOnce = once(onForcedExit);
	useEffect(() => {
		if (!isTimedOut) {
			return () => {
				console.log(isTimedOut);
				onExit('derendered component');
			};
		}
	}, [isTimedOut]);

	useBeforeUnload(() => {
		onExit('beforeunload');
	});

	useEffect(() => {
		const changingRoute = !matchPath(currentPath, editPath);
		if (changingRoute) {
			onExit('changingroute');
		}
	}, [currentPath]);

	const onAction = () => {
		onActivity();
		setIsWarningModalOpen(false);
		setIdleStart(null);
		setRemainingTime(initialTime);
	};

	const onIdle = () => {
		setIsWarningModalOpen(true);
		setIdleStart(new Date());
	};

	useIdleTimer({
		onAction,
		onIdle,
		throttle: EDIT_STATUS_REFETCH_TIME,
		// timeout: IDLE_TIME_UNTIL_WARNING,
		timeout: 5000,
	});

	useEffect(() => {
		let timerId: number | null = null;
		if (idleStart) {
			timerId = window.setInterval(() => {
				const idledTime = differenceInSeconds(new Date(), idleStart);

				setRemainingTime(Math.max(maxIdleTime - idledTime, 0));
			}, 500);
		}

		return () => {
			if (timerId) {
				clearInterval(timerId);
			}
		};
	}, [idleStart]);

	useEffect(() => {
		if (remainingTime === 0) {
			setIsTimedOut(true);
			console.log('timeout');
			forceExitOnce();
		}
	}, [remainingTime]);

	return (
		<Modal isOpen={isWarningModalOpen} title={tHtml('Opgelet!')} size="medium">
			<ModalBody>
				<p>{format(new Date(remainingTime * 1000), 'mm:ss')}</p>

				{warningMessage}
			</ModalBody>
		</Modal>
	);
};

export default InActivityWarningModal;
