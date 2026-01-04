import { AvoLomLomField } from '@viaa/avo2-types';
import { useEffect, useState } from 'react';
import { CustomError } from '../helpers/custom-error';
import { tHtml } from '../helpers/translate-html';
import { LomService } from '../services/lom.service';
import { ToastService } from '../services/toast-service';

type UseLomSubjectsTuple = [AvoLomLomField[], boolean];

export const useLomSubjects = (): UseLomSubjectsTuple => {
  const [subjects, setSubjects] = useState<AvoLomLomField[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);

    LomService.fetchSubjects()
      .then((subjects: AvoLomLomField[]) => {
        setSubjects(subjects);
      })
      .catch((err) => {
        console.error(
          new CustomError('Failed to get subjects from the database', err),
        );
        ToastService.danger(
          tHtml(
            'settings/components/profile___het-ophalen-van-de-vakken-is-mislukt',
          ),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return [subjects, isLoading];
};
