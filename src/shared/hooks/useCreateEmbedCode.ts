import { useMutation } from '@tanstack/react-query';

import { type EmbedCode, EmbedCodeService } from '../services/embed-code-service';

export const useCreateEmbedCode = () => {
	return useMutation(
		(embedCode: EmbedCode): Promise<string> => EmbedCodeService.createEmbedCode(embedCode)
	);
};
