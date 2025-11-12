import { useMutation } from '@tanstack/react-query';

import { EmbedCodeService } from '../embed-code-service.js';
import { type EmbedCode } from '../embed-code.types.js';

export const useCreateEmbedCode = () => {
	return useMutation(
		(embedCode: EmbedCode): Promise<EmbedCode> => EmbedCodeService.createEmbedCode(embedCode)
	);
};
