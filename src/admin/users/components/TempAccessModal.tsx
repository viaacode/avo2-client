import { get, noop } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	DatePicker,
	FormGroup,
	Modal,
	ModalBody,
	ModalFooterRight,
	Spacer,
} from '@viaa/avo2-components';

import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { toDateObject, toIsoDate } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { getTempAccessValidationErrors } from '../user.helpers';
import { UserTempAccess } from '../user.types';

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
	const [t] = useTranslation();

	const fromDate = tempAccess ? toDateObject(tempAccess.from) : null;
	const untilDate = tempAccess ? toDateObject(tempAccess.until) : null;

	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [from, setFrom] = useState<Date | null>(fromDate);
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
			setValidationError(validationErrors.map((rule) => get(rule[1], 'error')));
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
				<Button type="secondary" label={t('Annuleren')} onClick={onClose} />
				<Button type="primary" label={t('Opslaan')} onClick={onSave} />
			</ButtonToolbar>
		);
	};

	const renderModalBody = () => {
		return (
			<FormGroup error={validationError}>
				<BlockHeading className="u-m-0" type="h4">
					{t('Begindatum')}
				</BlockHeading>
				<DatePicker
					value={toDateObject(from)}
					onChange={(selectedDate) => {
						setFrom(selectedDate);
					}}
				/>
				<Spacer margin="top-large">
					<BlockHeading className="u-m-0" type="h4">
						{t('Einddatum')}
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
			title={t('Tijdelijke toegang instellen')}
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
