import React from 'react';
import { createRoot } from 'react-dom/client';
import EmbedApp from './EmbedApp';

createRoot(document.getElementById('embed-root')!).render(<EmbedApp />);
