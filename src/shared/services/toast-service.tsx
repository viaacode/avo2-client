import { isNil, isString } from 'lodash-es';
import React, { FunctionComponent, ReactNode } from 'react';
import { toast, ToastOptions } from 'react-toastify';

import { Alert, Spacer } from '@viaa/avo2-components';
import { AlertProps } from '@viaa/avo2-components/dist/components/Alert/Alert';

export enum ToastType {
	DANGER = 'danger',
	INFO = 'info',
	SPINNER = 'spinner',
	SUCCESS = 'success',
}

type ToastAlert = string | string[] | ReactNode;
type ToastServiceFn = (alert: ToastAlert, dark?: boolean, options?: ToastOptions) => void;
type ToastService = { [type in ToastType]: ToastServiceFn };

interface ToastProps extends AlertProps {
	closeToast?: () => void;
}

const Toast: FunctionComponent<ToastProps> = ({ closeToast, ...rest }) => (
	<Alert {...rest} className="u-spacer-top" onClose={closeToast} />
);

function showToast(
	alert: ToastAlert,
	dark: boolean = true,
	options: ToastOptions = {},
	alertType: ToastType = ToastType.INFO
) {
	if (isNil(alert)) {
		return;
	}

	let alertMessage = alert;

	if (Array.isArray(alert)) {
		const messages = alert as string[];
		alertMessage = (
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
	}

	toast(<Toast dark={dark} message={alertMessage} type={alertType} />, options);
}

const toastService: ToastService = {
	danger: (alert, dark, options) => showToast(alert, dark, options, ToastType.DANGER),
	info: (alert, dark, options) => showToast(alert, dark, options, ToastType.INFO),
	spinner: (alert, dark, options) => showToast(alert, dark, options, ToastType.SPINNER),
	success: (alert, dark, options) => showToast(alert, dark, options, ToastType.SUCCESS),
};

export default toastService;
