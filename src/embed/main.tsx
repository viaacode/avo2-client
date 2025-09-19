import React from 'react';
import { createRoot } from 'react-dom/client';

import { EmbedRoot } from './EmbedApp';

createRoot(document.getElementById('embed-root')!).render(<EmbedRoot />);
