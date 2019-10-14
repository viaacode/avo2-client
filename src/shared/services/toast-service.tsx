import React, { FunctionComponent, ReactNode } from 'react';
import { toast, ToastOptions } from 'react-toastify';

import { Alert } from '@viaa/avo2-components';
import { isNil, isString } from 'lodash-es';

export enum TOAST_TYPE {
	DANGER = 'danger',
	INFO = 'info',
	SPINNER = 'spinner',
	SUCCESS = 'success',
}

interface ToastInfo {
	message: string;
	type?: TOAST_TYPE;
	dark?: boolean;
	options?: ToastOptions;
}

const Toast: FunctionComponent<any> = ({ closeToast, ...rest }) => (
	<Alert {...rest} className="u-spacer-top" close={closeToast} />
);

export default function toastService(
	alert: ToastInfo | string | ReactNode,
	alertType: TOAST_TYPE = TOAST_TYPE.INFO
) {
	if (isNil(alert)) {
		return null;
	}

	if (isString(alert) || !(alert as ToastInfo).message) {
		return toast(<Toast message={alert} type={alertType} />);
	}

	const { options = {}, type = alertType, ...rest } = alert as ToastInfo;

	return toast(<Toast {...rest} type={type} />, options);
}
