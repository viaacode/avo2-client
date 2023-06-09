import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Button,
	ButtonToolbar,
	FormGroup,
	Modal,
	ModalBody,
	RadioButtonGroup,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import useTranslation from '../../shared/hooks/useTranslation';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { getValidationErrorsForPublish } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';

interface PublishAssignmentModalProps extends DefaultSecureRouteProps {
	isOpen: boolean;
	onClose: (assignment?: Avo.Assignment.Assignment) => void;
	assignment: Avo.Assignment.Assignment;
}

const PublishAssignmentModal: FunctionComponent<PublishAssignmentModalProps> = ({
	onClose,
	isOpen,
	assignment,
	user,
}) => {
	const { tText, tHtml } = useTranslation();

	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [isAssignmentPublic, setIsAssignmentPublic] = useState(assignment.is_public);

	useEffect(() => {
		setIsAssignmentPublic(assignment.is_public);
	}, [isOpen, setIsAssignmentPublic, assignment.is_public]);

	const onSave = async () => {
		try {
			const isPublished = isAssignmentPublic && !assignment.is_public;
			const isDepublished = !isAssignmentPublic && assignment.is_public;

			// Close modal when isPublic doesn't change
			if (!isPublished && !isDepublished) {
				onClose();
				return;
			}

			// Validate if user wants to publish
			if (isPublished) {
				const validationErrors: string[] = await getValidationErrorsForPublish(assignment);

				if (validationErrors && validationErrors.length) {
					setValidationError(validationErrors);
					ToastService.danger(validationErrors);
					return;
				}
			}

			const newAssignmentProps: Partial<Avo.Assignment.Assignment> = {
				is_public: isAssignmentPublic,
				published_at: new Date().toISOString(),
			};
			await AssignmentService.updateAssignmentProperties(assignment.id, newAssignmentProps);
			setValidationError(undefined);
			ToastService.success(
				isAssignmentPublic
					? tHtml('De opdracht staat nu publiek.')
					: tHtml('De opdracht staat nu niet meer publiek.')
			);
			closeModal({
				...assignment,
				...newAssignmentProps,
			});

			// Public status changed => log as event
			trackEvents(
				{
					object: String(assignment.id),
					object_type: 'assignment',
					action: isPublished ? 'publish' : 'unpublish',
				},
				user
			);
		} catch (err) {
			ToastService.danger(
				tHtml(
					'collection/components/modals/share-collection-modal___de-aanpassingen-kunnen-niet-worden-opgeslagen'
				)
			);
		}
	};

	const closeModal = (newAssignment?: Avo.Assignment.Assignment) => {
		setValidationError(undefined);
		onClose(newAssignment);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={tHtml('Deel deze opdracht.')}
			size="large"
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				<p>
					{tHtml(
						'Bepaal in hoeverre jouw opdracht toegankelijk is voor andere personen.'
					)}
				</p>
				<FormGroup error={validationError}>
					<Spacer margin="top-large">
						<BlockHeading className="u-m-0" type="h4">
							{tHtml('zichtbaarheid')}
						</BlockHeading>
					</Spacer>
					<RadioButtonGroup
						options={[
							{
								value: 'private',
								label: tText('Niet openbaar'),
							},
							{
								value: 'public',
								label: tText('Openbaar'),
							},
						]}
						value={isAssignmentPublic ? 'public' : 'private'}
						onChange={(value: string) => {
							setIsAssignmentPublic(value === 'public');
						}}
					/>
				</FormGroup>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									type="secondary"
									label={tText('annuleren')}
									onClick={() => onClose()}
								/>
								<Button type="primary" label={tText('opslaan')} onClick={onSave} />
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default PublishAssignmentModal;
