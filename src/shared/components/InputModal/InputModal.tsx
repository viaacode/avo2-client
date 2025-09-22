import {
	Button,
	ButtonToolbar,
	FormGroup,
	Modal,
	ModalBody,
	Spacer,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { type FC, type ReactNode, useEffect, useState } from 'react';

import { useTranslation } from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../services/toast-service';

interface InputModalProps {
	title?: string | ReactNode;
	inputLabel?: string;
	cancelLabel?: string;
	confirmLabel?: string;
	inputValue?: string;
	inputPlaceholder?: string;
	maxLength?: number;
	isOpen: boolean;
	onClose?: () => void;
	inputCallback: (input: string) => void;
	emptyMessage?: string;
}

export const InputModal: FC<InputModalProps> = ({
	inputValue,
	inputCallback,
	isOpen,
	title,
	inputLabel = '',
	inputPlaceholder = '',
	maxLength,
	cancelLabel,
	confirmLabel,
	onClose = noop,
	emptyMessage,
}) => {
	const { tText, tHtml } = useTranslation();

	const [input, setInput] = useState<string>('');

	useEffect(() => {
		if (isOpen) {
			setInput(inputValue || '');
		}
	}, [isOpen, inputValue]);

	// Listeners
	const onClickClose = () => {
		onClose();
		setInput(inputValue || '');
	};

	const onClickConfirm = () => {
		if (!input) {
			ToastService.danger(
				emptyMessage ||
					tHtml(
						'shared/components/input-modal/input-modal___gelieve-een-waarde-in-te-vullen'
					)
			);
			return null;
		}

		onClose();
		inputCallback(input);
	};

	const isInputTooLong = () => {
		return input.length > (maxLength || Infinity);
	};

	// Render
	return (
		<Modal
			isOpen={isOpen}
			title={title || tHtml('shared/components/input-modal/input-modal___vul-in')}
			size="small"
			onClose={onClickClose}
			scrollable
		>
			<ModalBody>
				<Spacer margin="bottom-large">
					<FormGroup label={inputLabel} labelFor="collectionNameId" required>
						<TextInput
							type="text"
							value={input}
							onChange={setInput}
							placeholder={inputPlaceholder}
						/>
						{maxLength && (
							<Spacer margin="top-small">
								<span>
									{isInputTooLong()
										? `${tText(
												'shared/components/input-modal/input-modal___de-invoer-is-te-lang-maxiumum-lengte'
										  )} ${maxLength}`
										: `${input.length}/${maxLength}`}
								</span>
							</Spacer>
						)}
					</FormGroup>
				</Spacer>
				<Toolbar>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									type="secondary"
									label={
										cancelLabel ||
										tText(
											'shared/components/input-modal/input-modal___annuleer'
										)
									}
									onClick={onClickClose}
								/>
								<Button
									type="primary"
									label={
										confirmLabel ||
										tText('shared/components/input-modal/input-modal___opslaan')
									}
									onClick={isInputTooLong() ? noop : onClickConfirm}
									disabled={isInputTooLong()}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};
