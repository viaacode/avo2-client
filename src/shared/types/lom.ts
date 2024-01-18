import { type Avo } from '@viaa/avo2-types';
import { LomType } from '@viaa/avo2-types';

export type LomFieldsByScheme = Record<Exclude<LomType, 'context'>, Avo.Lom.LomField[]>;
