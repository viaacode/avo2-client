import { Modal, ModalBody } from '@viaa/avo2-components';
import { differenceInSeconds, format } from 'date-fns';
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
	const maxIdleTime = MAX_EDIT_IDLE_TIME / 1000;
	const [remainingTime, setRemainingTime] = useState<number>(maxIdleTime);
	const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);
	const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
	const [idleStart, setIdleStart] = useState<Date | null>(null);

	useEffect(() => {
		if (!isTimedOut) {
			return () => {
				onExit();
			};
		}
	}, [isTimedOut]);

	useBeforeUnload(() => {
		onExit();
	});

	useEffect(() => {
		const changingRoute = !matchPath(currentPath, editPath);
		if (changingRoute) {
			onExit();
		}
	}, [currentPath]);

	const handleOnAction = () => {
		setIdleStart(null);
		setRemainingTime(maxIdleTime);
		setIsWarningModalOpen(false);
		onActivity();
		reset();
	};

	const onIdle = () => {
		setIsWarningModalOpen(true);
		setIdleStart(new Date());
	};

	const { reset } = useIdleTimer({
		onAction: handleOnAction,
		onActive: handleOnAction,
		onIdle,
		throttle: EDIT_STATUS_REFETCH_TIME,
		timeout: IDLE_TIME_UNTIL_WARNING,
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
			onForcedExit();
		}
	}, [remainingTime]);

	return (
		<Modal
			isOpen={isWarningModalOpen}
			title={tHtml(
				'shared/components/in-activity-warning-modal/in-activity-warning-modal___opgelet'
			)}
			size="medium"
		>
			<ModalBody>
				<p>{format(new Date(remainingTime * 1000), 'mm:ss')}</p>

				{warningMessage}
			</ModalBody>
		</Modal>
	);
};

export default InActivityWarningModal;