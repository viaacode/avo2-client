import React, { FunctionComponent } from 'react';
import { toast, ToastOptions } from 'react-toastify';

import { Alert } from '@viaa/avo2-components';
import { isNil, isString } from 'lodash-es';

export enum TOAST_TYPE {
	DANGER = 'danger',
	INFO = 'info',
	Spinner = 'spinner',
	SUCCESS = 'success',
}

interface ToastService {
	m: string;
	t?: TOAST_TYPE;
	dark?: boolean;
	options?: ToastOptions;
}

const Toast: FunctionComponent<any> = ({ closeToast, ...rest }) => (
	<Alert {...rest} className="u-spacer-top" close={closeToast} />
);

export default function toastService(message: ToastService | string) {
	const defaultType = TOAST_TYPE.INFO;

	if (isNil(message)) {
		return null;
	}

	if (isString(message)) {
		return toast(<Toast message={message} type={defaultType} />);
	}

	const { dark, m, options = {}, t = defaultType } = message;

	return toast(<Toast dark={dark} message={m} type={t} />, options);
}
