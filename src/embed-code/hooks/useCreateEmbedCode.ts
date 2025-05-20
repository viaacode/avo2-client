import { useMutation } from '@tanstack/react-query';

import { EmbedCodeService } from '../embed-code-service';
import { type EmbedCode } from '../embed-code.types';

export const useCreateEmbedCode = () => {
	return useMutation(
		(embedCode: EmbedCode): Promise<string> => EmbedCodeService.createEmbedCode(embedCode)
	);
};
