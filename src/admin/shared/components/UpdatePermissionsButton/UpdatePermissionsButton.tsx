import { isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@viaa/avo2-components';

import { PermissionService } from '../../../../authentication/helpers/permission-service';
import { CustomError } from '../../../../shared/helpers';
import { ToastService } from '../../../../shared/services';

import './UpdatePermissionsButton.scss';

interface UpdatePermissionsButtonProps {}

export const UpdatePermissionsButton: FunctionComponent<UpdatePermissionsButtonProps> = () => {
	const [t] = useTranslation();
	// undefined: progress has not been fetched yet
	// null: progress has been fetched, and there is currently no task in progress
	// number: progress has been fetched and there is currently a task in progress. Number indicated % completed
	const [progress, setProgress] = useState<number | null | undefined>(undefined);

	const inProgress = !isNil(progress);

	const getLabel = () => {
		if (isNil(progress)) {
			return t('Permissies toepassen');
		}
		return t('Bezig met permissies toepassen: {{percentage}}%', { percentage: progress });
	};

	const updateProgress = useCallback(async (): Promise<void> => {
		const newProgress = await PermissionService.getUpdatePermissionsProgress();
		setProgress((oldProgress) => {
			// progress went from percentage to null => that means it completed the task
			if (!isNil(oldProgress) && isNil(newProgress)) {
				ToastService.success(t('Het toepassen van de permissies is voltooid'));
			}
			return newProgress;
		});
	}, [setProgress, t]);

	useEffect(() => {
		updateProgress();
		const timerId = setInterval(updateProgress, 5000);

		return () => {
			clearInterval(timerId);
		};
	}, [updateProgress]);

	const triggerUpdatePermissions = async () => {
		try {
			await updateProgress();

			if (!isNil(progress)) {
				ToastService.danger(t(`Een update is reeds bezig (${progress}%)`), false);
				return;
			}
			const result: {
				message?: string;
				error?: string;
			} = await PermissionService.triggerUpdatePermissions();
			if (result && result.message === 'started') {
				ToastService.success(t('Permissie update wordt gestart'), false);
			} else {
				console.error(new CustomError('Permission update start failed', { result }));
				ToastService.info(t(`Permissie update is reeds bezig`), false);
			}

			await updateProgress();
		} catch (err) {
			console.error(new CustomError('Failed to trigger MAM sync', err));
			ToastService.danger(
				t(
					'admin/items/views/publish-items-overview___het-triggeren-van-een-mam-synchronisatie-is-mislukt'
				),
				false
			);
		}
	};

	if (typeof progress === 'undefined') {
		return null;
	}

	return (
		<Button
			onClick={inProgress ? () => {} : triggerUpdatePermissions}
			label={getLabel()}
			disabled={inProgress}
			type="danger"
		/>
	);
};
