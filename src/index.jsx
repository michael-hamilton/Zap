import React from 'react';
import {createRoot} from 'react-dom/client';
import Editor from './zap';

const root = createRoot(document.getElementById('root'));
root.render(<Editor />);