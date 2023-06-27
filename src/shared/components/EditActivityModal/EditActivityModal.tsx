import React, { FC, useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

type EditActivityModalProps = {
	onActivity: () => void;
};

const EditActivityModal: FC<EditActivityModalProps> = ({ onActivity }) => {
	const [remainingTime, setRemainingTime] = useState<number>(0);
	const { getRemainingTime } = useIdleTimer({
		onAction: onActivity,
		throttle: 15000,
		timeout: 60_000,
	});

	useEffect(() => {
		const interval = setInterval(() => {
			setRemainingTime(Math.ceil(getRemainingTime() / 1000));
		}, 500);

		return () => {
			clearInterval(interval);
		};
	});

	// TODO: replace with modal AVO-2655
	return <div>{remainingTime}</div>;
};

export default EditActivityModal;
