import React, { FC } from 'react';
import { Slide, toast, ToastOptions } from 'react-toastify';

import { Alert } from '@viaa/avo2-components/src/components/Alert/Alert';

export enum TOAST_TYPE {
	DANGER = 'danger',
	INFO = 'info',
	Spinner = 'spinner',
	SUCCESS = 'success',
}

const Toast: FC<any> = ({ closeToast, message, type }) => (
	<Alert close={closeToast} message={message} type={type} />
);

const toastOptions: ToastOptions = {
	closeOnClick: false,
	draggable: false,
	transition: Slide,
};

export default function toastService(message: string, type = TOAST_TYPE.INFO) {
	return toast(<Toast message={message} type={type} />, toastOptions);
}
