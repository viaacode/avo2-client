import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Button,
	ButtonToolbar,
	DatePicker,
	FormGroup,
	Modal,
	ModalBody,
	ModalFooterRight,
	Spacer,
} from '@viaa/avo2-components';
import { UserTempAccess } from '@viaa/avo2-types/types/user';
import { noop } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { toDateObject, toIsoDate } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { getTempAccessValidationErrors } from '../user.helpers';

interface TempAccessModalProps {
	tempAccess: UserTempAccess | null;
	isOpen: boolean;
	onClose?: () => void;
	setTempAccessCallback: (tempAccess: UserTempAccess) => void;
}

const TempAccessModal: FunctionComponent<TempAccessModalProps> = ({
	tempAccess,
	isOpen,
	onClose,
	setTempAccessCallback,
}) => {
	const { tText, tHtml } = useTranslation();

	const fromDate = tempAccess ? toDateObject(tempAccess.from) : null;
	const untilDate = tempAccess ? toDateObject(tempAccess.until) : null;

	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [from, setFrom] = useState<Date | null>(fromDate || new Date(Date.now()));
	const [until, setUntil] = useState<Date | null>(untilDate);

	useEffect(() => {
		if (isOpen) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [isOpen, setLoadingInfo]);

	const onSave = async () => {
		const newTempAccess = {
			from: from === null ? null : toIsoDate(from),
			until: until === null ? null : toIsoDate(until),
		};

		const validationErrors: string[] = getTempAccessValidationErrors(newTempAccess);

		if (validationErrors && validationErrors.length) {
			setValidationError(validationErrors);
			ToastService.danger(validationErrors);
			return;
		}

		setValidationError(undefined);
		setTempAccessCallback(newTempAccess);

		(onClose || noop)();
	};

	const renderConfirmButtons = () => {
		return (
			<ButtonToolbar>
				<Button
					type="secondary"
					label={tText('admin/users/components/temp-access-modal___annuleren')}
					onClick={onClose}
				/>
				<Button
					type="primary"
					label={tText('admin/users/components/temp-access-modal___opslaan')}
					onClick={onSave}
				/>
			</ButtonToolbar>
		);
	};

	const renderModalBody = () => {
		return (
			<FormGroup error={validationError}>
				<BlockHeading className="u-m-0" type="h4">
					{tHtml('admin/users/components/temp-access-modal___begindatum')}
				</BlockHeading>
				<DatePicker
					value={toDateObject(from)}
					onChange={(selectedDate) => {
						setFrom(selectedDate);
					}}
				/>
				<Spacer margin="top-large">
					<BlockHeading className="u-m-0" type="h4">
						{tHtml('admin/users/components/temp-access-modal___einddatum')}
					</BlockHeading>
				</Spacer>
				<DatePicker
					value={toDateObject(until)}
					onChange={(selectedDate) => {
						setUntil(selectedDate);
					}}
				/>
			</FormGroup>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={tText('admin/users/components/temp-access-modal___tijdelijke-toegang-instellen')}
			size="small"
			onClose={onClose}
		>
			<ModalBody>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={{}}
					render={renderModalBody}
				/>
			</ModalBody>
			<ModalFooterRight>{renderConfirmButtons()}</ModalFooterRight>
		</Modal>
	);
};

export default TempAccessModal;
