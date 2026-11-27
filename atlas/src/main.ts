import './styles/fonts.css';
import './styles/tokens.css';
import './styles/shell.css';

import { CH01_HWE } from './chapters/ch01_hwe';
import { CH01_LIMBS } from './chapters/ch01_limbs';
import { AtlasShell } from './shell/AtlasShell';

const root = document.getElementById('atlas-root');
if (!root) {
  throw new Error('Missing #atlas-root mount element');
}

new AtlasShell(root, [CH01_HWE, CH01_LIMBS]);
