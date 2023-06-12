import { Avo } from '@viaa/avo2-types';

export interface LomFieldsByScheme {
	context: Avo.Lom.LomField[];
	educationLevel: Avo.Lom.LomField[];
	subject: Avo.Lom.LomField[];
	theme: Avo.Lom.LomField[];
}

export type LomSchemeType = keyof LomFieldsByScheme;
