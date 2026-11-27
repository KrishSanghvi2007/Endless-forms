import './styles/fonts.css';
import './styles/tokens.css';
import './styles/shell.css';

import { CH01_HWE } from './chapters/ch01_hwe';
import { CH01_LIMBS } from './chapters/ch01_limbs';
import { CH02_SOCIAL } from './chapters/ch02_social';
import { CH03_LICHEN } from './chapters/ch03_lichen';
import { CH04_CASINO } from './chapters/ch04_casino';
import { CH05_BITTER } from './chapters/ch05_bitter';
import { CH06_JAWS } from './chapters/ch06_jaws';
import { AtlasShell } from './shell/AtlasShell';

const root = document.getElementById('atlas-root');
if (!root) {
  throw new Error('Missing #atlas-root mount element');
}

new AtlasShell(root, [CH01_HWE, CH02_SOCIAL, CH03_LICHEN, CH04_CASINO, CH05_BITTER, CH06_JAWS, CH01_LIMBS]);
