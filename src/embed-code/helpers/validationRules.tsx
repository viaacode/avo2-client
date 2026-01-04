import { compact, isNil } from 'es-toolkit';

import { stripRichTextParagraph } from '../../shared/helpers/strip-rich-text-paragraph';
import { tText } from '../../shared/helpers/translate-text';
import { type EmbedCode } from '../embed-code.types';

// Validation
type ValidationRule<T> = {
  error: string | ((object: T) => string);
  isValid: (object: T) => boolean;
};

export const getValidationErrors = (embedCode: EmbedCode): string[] => {
  const validationErrors = [
    ...GET_VALIDATION_RULES(),
    ...GET_VALIDATION_RULES_FOR_START_AND_END_TIMES_FRAGMENT(),
  ].map((rule) => {
    return rule.isValid(embedCode) ? null : getError(rule, embedCode);
  });
  return compact(validationErrors);
};

const GET_VALIDATION_RULES = (): ValidationRule<Partial<EmbedCode>>[] => [
  {
    error: () =>
      tText(
        'embed-code/helpers/validation-rules___het-fragment-heeft-geen-titel',
      ),
    isValid: (embedCode) => !!embedCode.title,
  },
  {
    error: () =>
      tText(
        'embed-code/helpers/validation-rules___het-fragment-heeft-geen-inhoud',
      ),
    isValid: (embedCode) => {
      if (embedCode.descriptionType !== 'CUSTOM') {
        return true;
      }
      const cleanedUpDescription = stripRichTextParagraph(
        embedCode.description || '',
      );
      return !!cleanedUpDescription;
    },
  },
];

const GET_VALIDATION_RULES_FOR_START_AND_END_TIMES_FRAGMENT: () => ValidationRule<
  Pick<EmbedCode, 'start' | 'end'>
>[] = () => [
  {
    error: tText(
      'embed-code/helpers/validation-rules___de-starttijd-heeft-geen-geldig-formaat-uu-mm-ss',
    ),
    isValid: (embedCode) => !isNil(embedCode.start),
  },
  {
    error: tText(
      'embed-code/helpers/validation-rules___de-eindtijd-heeft-geen-geldig-formaat-uu-mm-ss',
    ),
    isValid: (embedCode) => !isNil(embedCode.end),
  },
  {
    error: tText(
      'embed-code/helpers/validation-rules___de-starttijd-moet-voor-de-eindtijd-vallen',
    ),
    isValid: (embedCode) => {
      return (
        !embedCode.start || !embedCode.end || embedCode.start < embedCode.end
      );
    },
  },
];

function getError<T>(rule: ValidationRule<T>, object: T) {
  if (typeof rule.error === 'string') {
    return rule.error;
  }
  return rule.error(object);
}
