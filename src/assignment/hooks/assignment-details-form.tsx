import { useMemo } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ASSIGNMENT_DETAILS_FORM_FIELDS } from '../assignment.const';
import { AssignmentFormState } from '../assignment.types';
import AssignmentDetailsForm, {
	AssignmentDetailsFormProps,
} from '../components/AssignmentDetailsForm';

export function useAssignmentDetailsForm(
	assignment: AssignmentFormState,
	setAssignment: React.Dispatch<React.SetStateAction<AssignmentFormState>>,
	setValue: UseFormSetValue<AssignmentFormState>,
	config?: Partial<AssignmentDetailsFormProps>
) {
	const [t] = useTranslation();

	const fields = useMemo(() => {
		const unmapped = ASSIGNMENT_DETAILS_FORM_FIELDS(t);
		const mapped: Record<string, any> = {};

		Object.keys(unmapped).forEach((key) => {
			const cast = key as keyof typeof unmapped;
			const field = unmapped[cast];

			// Enrich each field with an onChange event to mark them
			mapped[cast] = {
				...field,
				onChange: () => {
					switch (cast) {
						case 'classrooms':
							setValue('labels', assignment.labels, { shouldDirty: true });
							break;

						default:
							setValue(cast, assignment[cast], { shouldDirty: true });
							break;
					}
				},
			};
		});

		return mapped as typeof unmapped;
	}, [t, assignment, setValue]);

	const ui = useMemo(
		() => <AssignmentDetailsForm state={[assignment, setAssignment]} {...config} {...fields} />,
		[assignment, setAssignment, fields]
	);

	return [ui, fields];
}
