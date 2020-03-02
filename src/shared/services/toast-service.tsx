import { isNil } from 'lodash-es';
import React, { FunctionComponent, ReactNode } from 'react';
import { toast, ToastOptions } from 'react-toastify';

import { Alert, AlertProps, Spacer } from '@viaa/avo2-components';

export enum ToastType {
	DANGER = 'danger',
	INFO = 'info',
	SPINNER = 'spinner',
	SUCCESS = 'success',
}

type ToastMessage = string | string[] | ReactNode;

interface ToastProps extends AlertProps {
	closeToast?: () => void;
}

const Toast: FunctionComponent<ToastProps> = ({ closeToast, ...rest }) => (
	<Alert {...rest} className="u-spacer-top" onClose={closeToast} />
);

function showToast(
	message: ToastMessage,
	dark: boolean = true,
	options: ToastOptions = {},
	alertType: ToastType = ToastType.INFO
) {
	if (isNil(message)) {
		return;
	}

	let alertMessage = message;

	if (Array.isArray(message)) {
		const messages = message as string[];
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

export class ToastService {
	public static danger = (message: ToastMessage, dark?: boolean, options?: ToastOptions) =>
		showToast(message, dark, options, ToastType.DANGER);
	public static info = (message: ToastMessage, dark?: boolean, options?: ToastOptions) =>
		showToast(message, dark, options, ToastType.INFO);
	public static spinner = (message: ToastMessage, dark?: boolean, options?: ToastOptions) =>
		showToast(message, dark, options, ToastType.SPINNER);
	public static success = (message: ToastMessage, dark?: boolean, options?: ToastOptions) =>
		showToast(message, dark, options, ToastType.SUCCESS);
}
