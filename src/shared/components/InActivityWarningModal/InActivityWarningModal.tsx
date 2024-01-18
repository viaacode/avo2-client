import { Modal, ModalBody } from '@viaa/avo2-components';
import { addMinutes, differenceInSeconds, isAfter } from 'date-fns';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { connect } from 'react-redux';
import { matchPath } from 'react-router';
import { compose } from 'redux';

import { AppState } from '../../../store';
import { selectLastVideoPlayedAt } from '../../../store/selectors';
import {
	EDIT_STATUS_REFETCH_TIME,
	IDLE_TIME_UNTIL_WARNING,
	MAX_EDIT_IDLE_TIME,
} from '../../constants';
import { formatDurationMinutesSeconds } from '../../helpers';
import { tHtml } from '../../helpers/translate';
import { useBeforeUnload } from '../../hooks/useBeforeUnload';

type InActivityWarningModalProps = {
	onActivity: () => void;
	onExit: () => void;
	onForcedExit: () => void;
	warningMessage: string | ReactNode;
	editPath: string;
	currentPath: string;
};

const InActivityWarningModal: FC<
	InActivityWarningModalProps & { lastVideoPlayedAt: Date | null }
> = ({
	onActivity,
	onExit,
	onForcedExit,
	warningMessage,
	editPath,
	currentPath,
	lastVideoPlayedAt,
}) => {
	const maxIdleTime = MAX_EDIT_IDLE_TIME / 1000;
	const [remainingTime, setRemainingTime] = useState<number>(maxIdleTime);
	const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);
	const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
	const [idleStart, setIdleStart] = useState<Date | null>(null);
	const [documentTitle] = useState(document.title);

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
		// Last video play was less than 1 minute ago?
		if (!!lastVideoPlayedAt && isAfter(lastVideoPlayedAt, addMinutes(new Date(), -1))) {
			// Video is playing => do not show modal
			// https://meemoo.atlassian.net/browse/AVO-2983
		} else {
			// No video is playing and user is idle
			setIsWarningModalOpen(true);
			setIdleStart(new Date());
		}
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

		// AVO-2846: show timer before tab title when timer starts counting down
		if (remainingTime < maxIdleTime) {
			document.title = formatDurationMinutesSeconds(remainingTime) + ' | ' + documentTitle;
		}

		// AVO-2846: hide timer in tab title when there is activity
		if (remainingTime >= maxIdleTime) {
			document.title = documentTitle;
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
				<p>{formatDurationMinutesSeconds(remainingTime)}</p>

				{warningMessage}
			</ModalBody>
		</Modal>
	);
};
const mapStateToProps = (state: AppState) => ({
	lastVideoPlayedAt: selectLastVideoPlayedAt(state),
});

export default compose(connect(mapStateToProps))(
	InActivityWarningModal
) as FC<InActivityWarningModalProps>;
