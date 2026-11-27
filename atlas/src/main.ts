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
import { CH07_ENGINE } from './chapters/ch07_engine';
import { CH08_RAFFLE } from './chapters/ch08_raffle';
import { CH09_SEX } from './chapters/ch09_sex';
import { CH10_SWITCH } from './chapters/ch10_switch';
import { CH12_TREES } from './chapters/ch12_trees';
import { CH13_SPECIES } from './chapters/ch13_species';
import { CH14_DEEPTIME } from './chapters/ch14_deeptime';
import { CH15_ECOLOGY } from './chapters/ch15_ecology';
import { CH16_CLINIC } from './chapters/ch16_clinic';
import { CH17_PRICE } from './chapters/ch17_price';
import { AtlasShell } from './shell/AtlasShell';

const root = document.getElementById('atlas-root');
if (!root) {
  throw new Error('Missing #atlas-root mount element');
}

new AtlasShell(root, [CH01_HWE, CH02_SOCIAL, CH03_LICHEN, CH04_CASINO, CH05_BITTER, CH06_JAWS, CH07_ENGINE, CH08_RAFFLE, CH09_SEX, CH10_SWITCH, CH01_LIMBS, CH12_TREES, CH13_SPECIES, CH14_DEEPTIME, CH15_ECOLOGY, CH16_CLINIC, CH17_PRICE]);
