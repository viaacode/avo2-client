import { useEffect, useState } from 'react';

import { AssignmentLabel } from '../../assignment/assignment.types';
import useTranslation from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers';
import { AssignmentLabelsService } from '../services/assignment-labels-service';
import { ToastService } from '../services/toast-service';

type UseAssignmentLabelsTuple = [AssignmentLabel[], boolean];

export const useAssignmentLabels = (enabled: boolean): UseAssignmentLabelsTuple => {
	const { tText, tHtml } = useTranslation();

	const [assignmentLabels, setAssignmentLabels] = useState<AssignmentLabel[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!enabled) {
			return;
		}
		setIsLoading(true);

		AssignmentLabelsService.getLabels()
			.then((assignmentLabels) => {
				const labelsAssignment = assignmentLabels.map((assignment) => {
					return {
						value: assignment.label || '',
						description: assignment.type,
					};
				});
				setAssignmentLabels(labelsAssignment);
			})
			.catch((err) => {
				console.error(
					new CustomError('Failed to get AssignmentLabels from the database', err)
				);
				ToastService.danger(
					tHtml(
						'shared/hooks/use-assignment-labels___het-ophalen-van-de-labels-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [tText]);

	return [assignmentLabels, isLoading];
};
