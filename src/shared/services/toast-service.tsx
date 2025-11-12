import {ToastType} from '@meemoo/admin-core-ui/client';
import {Alert, type AlertProps, Spacer} from '@viaa/avo2-components';
import {isNil} from 'es-toolkit';
import React, {type FC, type ReactNode} from 'react';
import {toast, type ToastId, type ToastOptions} from 'react-toastify';

import {ROUTE_PARTS} from '../constants/index.js';

export enum AvoToastType {
	DANGER = 'danger',
	INFO = 'info',
	SPINNER = 'spinner',
	SUCCESS = 'success',
}

export const ToastTypeToAvoToastType: Record<ToastType, AvoToastType> = {
	[ToastType.ERROR]: AvoToastType.DANGER,
	[ToastType.INFO]: AvoToastType.INFO,
	[ToastType.SPINNER]: AvoToastType.SPINNER,
	[ToastType.SUCCESS]: AvoToastType.SUCCESS,
};

type ToastMessage = string | string[] | ReactNode;

interface ToastProps extends AlertProps {
	closeToast?: () => void;
}

const Toast: FC<ToastProps> = ({ closeToast, ...rest }) => (
	<Alert {...rest} className="u-spacer-top" onClose={closeToast} />
);

export class ToastService {
	public static danger = (message: ToastMessage, options?: ToastOptions): ToastId | undefined =>
		ToastService.showToast(message, options, AvoToastType.DANGER);
	public static info = (message: ToastMessage, options?: ToastOptions): ToastId | undefined =>
		ToastService.showToast(message, options, AvoToastType.INFO);
	public static spinner = (message: ToastMessage, options?: ToastOptions): ToastId | undefined =>
		ToastService.showToast(message, options, AvoToastType.SPINNER);
	public static success = (message: ToastMessage, options?: ToastOptions): ToastId | undefined =>
		ToastService.showToast(message, options, AvoToastType.SUCCESS);

	public static close(toastId: ToastId | undefined) {
		if (isNil(toastId)) {
			return;
		}
		toast.dismiss(toastId);
	}

	public static showToast(
		message: ToastMessage,
		options: ToastOptions = {},
		alertType: AvoToastType = AvoToastType.INFO
	): ToastId | undefined {
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
							<Spacer margin="bottom-small" key={`toast-message-${index}`}>
								{message}
							</Spacer>
						) : (
							message
						);
					})}
				</div>
			);
		}

		const dark = !window.location.href.includes(`/${ROUTE_PARTS.admin}/`);

		return toast(<Toast dark={dark} message={alertMessage} type={alertType} />, options);
	}

	public static hideToast(toastId: ToastId) {
		toast.dismiss(toastId);
	}
}
