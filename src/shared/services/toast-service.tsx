import React, { FunctionComponent } from 'react';
import { toast, ToastOptions } from 'react-toastify';

import { Alert } from '@viaa/avo2-components';
import { isNil, isString } from 'lodash-es';

export enum TOAST_TYPE {
	DANGER = 'danger',
	INFO = 'info',
	SPINNER = 'spinner',
	SUCCESS = 'success',
}

interface ToastService {
	message: string;
	type?: TOAST_TYPE;
	dark?: boolean;
	options?: ToastOptions;
}

interface ToastService {
	message: string;
	type?: TOAST_TYPE;
	dark?: boolean;
	options?: ToastOptions;
}

const Toast: FunctionComponent<any> = ({ closeToast, ...rest }) => (
	<Alert {...rest} className="u-spacer-top" close={closeToast} />
);

export default function toastService(
	alert: ToastService | string,
	alertType: TOAST_TYPE = TOAST_TYPE.INFO
) {
	if (isNil(alert)) {
		return null;
	}

	if (isString(alert)) {
		return toast(<Toast message={alert} type={alertType} />);
	}

	const { options = {}, type = alertType, ...rest } = alert;

	return toast(<Toast {...rest} type={type} />, options);
}
