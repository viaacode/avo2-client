import React, { FC } from 'react';
import { Slide, toast, ToastOptions } from 'react-toastify';

import { Alert } from '@viaa/avo2-components/src/components/Alert/Alert';

const Toast: FC<any> = ({ closeToast, message, type }) => (
	<Alert close={closeToast} message={message} type={type} />
);

const toastOptions: ToastOptions = {
	closeOnClick: false,
	draggable: false,
	transition: Slide,
};

export default function toastService(message: string, type = 'info') {
	return toast(<Toast message={message} type={type} />, toastOptions);
}
