import { ToastType } from '@meemoo/admin-core-ui/client';
import { Alert, type AlertProps, Spacer } from '@viaa/avo2-components';
import { isNil } from 'es-toolkit';
import { type FC, type ReactNode } from 'react';
import { type Id, type ToastOptions, toast } from 'react-toastify';
import { ROUTE_PARTS } from '../constants/routes';

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
  data: {
    message: ToastMessage;
    type: AvoToastType;
  };
}

const Toast: FC<ToastProps> = (toastProps: ToastProps) => {
  const dark = !window.location.href.includes(`/${ROUTE_PARTS.admin}/`);
  return (
    <Alert
      dark={dark}
      message={toastProps.data.message}
      type={toastProps.data.type}
      className="u-spacer-top"
      onClose={toastProps.closeToast}
    />
  );
};

export class ToastService {
  public static danger = (
    message: ToastMessage,
    options?: ToastOptions,
  ): Id | undefined =>
    ToastService.showToast(message, options, AvoToastType.DANGER);
  public static info = (
    message: ToastMessage,
    options?: ToastOptions,
  ): Id | undefined =>
    ToastService.showToast(message, options, AvoToastType.INFO);
  public static spinner = (
    message: ToastMessage,
    options?: ToastOptions,
  ): Id | undefined =>
    ToastService.showToast(message, options, AvoToastType.SPINNER);
  public static success = (
    message: ToastMessage,
    options?: ToastOptions,
  ): Id | undefined =>
    ToastService.showToast(message, options, AvoToastType.SUCCESS);

  public static close(toastId: Id | undefined) {
    if (isNil(toastId)) {
      return;
    }
    toast.dismiss(toastId);
  }

  public static showToast(
    message: ToastMessage,
    options: ToastOptions = {},
    alertType: AvoToastType = AvoToastType.INFO,
  ): Id | undefined {
    if (isNil(message)) {
      return;
    }

    let alertMessage: ToastMessage = message;

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

    const data = {
      message: alertMessage,
      type: alertType,
    } as {
      message: ToastMessage;
      type: AvoToastType;
    };

    return toast(Toast, {
      closeButton: false,
      data: data as any,
      ...options,
    });
  }

  public static hideToast(toastId: Id) {
    toast.dismiss(toastId);
  }
}
