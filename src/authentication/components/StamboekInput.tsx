import {
	Alert,
	Button,
	Icon,
	IconName,
	Spacer,
	TextInput,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FunctionComponent, type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';

import stamboekExampleImage from '../../assets/images/leerkrachten-kaart-voorbeeld-nummer.png';
import { APP_PATH } from '../../constants';
import useTranslation from '../../shared/hooks/useTranslation';
import { AvoToastType } from '../../shared/services/toast-service';
import { verifyStamboekNumber } from '../authentication.service';
import { type StamboekValidationStatus } from '../views/registration-flow/r3-stamboek';

import './StamboekInput.scss';

export interface StamboekInputProps {
	value?: string;
	onChange: (validStamboekNumber: string) => void;
}

export const StamboekInput: FunctionComponent<StamboekInputProps> = ({ onChange, value = '' }) => {
	const { tText, tHtml } = useTranslation();

	const [stamboekValidationStatus, setStamboekValidationStatus] =
		useState<StamboekValidationStatus>('INCOMPLETE');
	const [rawStamboekNumber, setRawStamboekNumber] = useState<string>(value);

	const STAMBOEK_MESSAGES: {
		/* eslint-disable @typescript-eslint/no-unused-vars */
		[status in StamboekValidationStatus]: {
			/* eslint-enable @typescript-eslint/no-unused-vars */
			message: string | ReactNode;
			status: AvoToastType | undefined;
		};
	} = {
		INCOMPLETE: {
			message: '',
			status: undefined,
		},
		INVALID_FORMAT: {
			message: tHtml(
				'authentication/components/stamboek-input___het-stamboek-nummer-heeft-een-ongeldig-formaat-geldige-formaten-00000000000-of-00000000000-000000'
			),
			status: AvoToastType.DANGER,
		},
		INVALID_NUMBER: {
			message: (
				<span>
					{tHtml(
						'authentication/components/stamboek-input___het-stamboek-nummer-is-niet-geldig-of-nog-niet-geactiveerd'
					)}
					<br />
					<Spacer margin="top-small">
						<Link to={APP_PATH.MANUAL_ACCESS_REQUEST.route}>
							<Button
								label={tText(
									'authentication/components/stamboek-input___manuele-aanvraag-indienen'
								)}
							/>
						</Link>
					</Spacer>
				</span>
			),
			status: AvoToastType.DANGER,
		},
		VALID_FORMAT: {
			message: tHtml('authentication/components/stamboek-input___bezig-met-valideren'),
			status: AvoToastType.SPINNER,
		},
		VALID: {
			message: tHtml(
				'authentication/components/stamboek-input___het-stamboek-nummer-is-geldig'
			),
			status: AvoToastType.SUCCESS,
		},
		ALREADY_IN_USE: {
			message: tHtml(
				'authentication/components/stamboek-input___dit-stamboek-nummer-is-reeds-in-gebruik'
			),
			status: AvoToastType.DANGER,
		},
		SERVER_ERROR: {
			message: tHtml(
				'authentication/components/stamboek-input___er-ging-iets-mis-bij-het-valideren-van-het-stamboek-nummer-probeer-later-eens-opnieuw'
			),
			status: AvoToastType.DANGER,
		},
	};

	const setStamboekNumber = async (rawStamboekNumber: string) => {
		try {
			setRawStamboekNumber(rawStamboekNumber);
			const cleanedStamboekNumber = rawStamboekNumber.replace(/[^0-9-]+/, '');
			// Check if stamboek number is incomplete
			// eg: 3256
			// or: 43457876543-34
			if (/^[0-9]{0,10}$/g.test(cleanedStamboekNumber)) {
				onChange('');
				setStamboekValidationStatus('INCOMPLETE');
				return;
			}
			if (/^[0-9]{11}(-[0-9]*)?$/g.test(cleanedStamboekNumber)) {
				const stamboekNumber = cleanedStamboekNumber.substring(0, 11);
				setStamboekValidationStatus('VALID_FORMAT');
				const validationStatus: Avo.Stamboek.ValidationStatuses =
					await verifyStamboekNumber(stamboekNumber);
				if (validationStatus === 'VALID') {
					onChange(stamboekNumber);
					setStamboekValidationStatus('VALID');
				} else if (validationStatus === 'ALREADY_IN_USE') {
					onChange('');
					setStamboekValidationStatus('ALREADY_IN_USE');
				} else {
					// 'INVALID' server response
					onChange('');
					setStamboekValidationStatus('INVALID_NUMBER');
				}
			} else {
				onChange('');
				setStamboekValidationStatus('INVALID_FORMAT');
			}
		} catch (err) {
			onChange('');
			setStamboekValidationStatus('SERVER_ERROR');
		}
	};

	return (
		<Spacer className="m-stamboek-input" margin={['bottom-large']}>
			<TextInput
				placeholder={tText('authentication/components/stamboek-input___00000000000-000000')}
				value={rawStamboekNumber}
				onChange={setStamboekNumber}
			/>
			<Tooltip position="bottom" contentClassName="m-stamboek-tooltip">
				<TooltipTrigger>
					<span>
						<Icon className="a-info-icon" name={IconName.info} size="small" />
					</span>
				</TooltipTrigger>
				<TooltipContent>
					<Spacer margin={'small'}>
						<Spacer margin="bottom-small">
							<span>
								{tHtml(
									'authentication/components/stamboek-input___je-stamboek-nummer-staat-op-je-lerarenkaart'
								)}
							</span>
						</Spacer>
						<img
							alt={tText(
								'authentication/components/stamboek-input___voorbeeld-leeraren-kaart'
							)}
							className="a-stamboek-image"
							src={stamboekExampleImage}
						/>
					</Spacer>
				</TooltipContent>
			</Tooltip>
			<Spacer margin="top-small">
				{STAMBOEK_MESSAGES[stamboekValidationStatus].status && (
					<Alert type={STAMBOEK_MESSAGES[stamboekValidationStatus].status}>
						<Spacer margin="bottom-small">
							{STAMBOEK_MESSAGES[stamboekValidationStatus].message}
						</Spacer>
					</Alert>
				)}
			</Spacer>
		</Spacer>
	);
};
