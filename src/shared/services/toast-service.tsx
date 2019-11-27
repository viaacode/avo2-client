import { isNil, isString } from 'lodash-es';
import React, { FunctionComponent, ReactNode } from 'react';
import { toast, ToastOptions } from 'react-toastify';

import { Alert, Spacer } from '@viaa/avo2-components';
import { AlertProps } from '@viaa/avo2-components/dist/components/Alert/Alert';

enum ToastType {
	DANGER = 'danger',
	INFO = 'info',
	SPINNER = 'spinner',
	SUCCESS = 'success',
}

interface ToastInfo {
	message: string;
	type?: ToastType;
	dark?: boolean;
	options?: ToastOptions;
}

type ToastAlert = ToastInfo | string | string[] | ReactNode;

interface ToastProps extends AlertProps {
	closeToast?: () => void;
}

const Toast: FunctionComponent<ToastProps> = ({ closeToast, dark = true, ...rest }) => (
	<Alert {...rest} className="u-spacer-top" dark={dark} onClose={closeToast} />
);

function showToast(alert: ToastAlert, alertType: ToastType = ToastType.INFO) {
	if (isNil(alert)) {
		return null;
	}

	if (Array.isArray(alert)) {
		const messages = alert as string[];
		const multiLineMessage = (
			<div>
				{messages.map((message: string, index: number) => {
					return index + 1 !== messages.length ? (
						<Spacer margin="bottom-small">{message}</Spacer>
					) : (
						message
					);
				})}
			</div>
		);
		return toast(<Toast message={multiLineMessage} type={alertType} />);
	}

	if (isString(alert) || !(alert as ToastInfo).message) {
		return toast(<Toast message={alert} type={alertType} />);
	}

	const { options = {}, type = alertType, ...rest } = alert as ToastInfo;

	return toast(<Toast {...rest} type={type} />, options);
}

const toastService = {
	danger: (alert: ToastAlert) => showToast(alert, ToastType.DANGER),
	info: (alert: ToastAlert) => showToast(alert, ToastType.INFO),
	spinner: (alert: ToastAlert) => showToast(alert, ToastType.SPINNER),
	success: (alert: ToastAlert) => showToast(alert, ToastType.SUCCESS),
};

export default toastService;
