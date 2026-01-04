import { AvoLomLomField, type AvoLomLomType } from '@viaa/avo2-types';

export type LomFieldsByScheme = Record<
  Exclude<AvoLomLomType, 'context'>,
  AvoLomLomField[]
>;
