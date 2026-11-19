// Sammelt alle Musterantworten. Neue Inhaltsdateien hier importieren (und in sw.js FILES eintragen).
import { ANTWORTEN as grundlagen } from './theorie-grundlagen.js';
import { ANTWORTEN as glieder } from './theorie-glieder.js';
import { ANTWORTEN as sps } from './sps-theorie.js';
import { ANTWORTEN as python } from './python-theorie.js';

import { ANTWORTEN as v01 } from './vorlesung-01.js';
import { ANTWORTEN as v02 } from './vorlesung-02.js';
import { ANTWORTEN as v03 } from './vorlesung-03.js';
import { ANTWORTEN as v04 } from './vorlesung-04.js';
import { ANTWORTEN as v05 } from './vorlesung-05.js';
import { ANTWORTEN as v06 } from './vorlesung-06.js';
import { ANTWORTEN as v07 } from './vorlesung-07.js';
import { ANTWORTEN as v08 } from './vorlesung-08.js';
import { ANTWORTEN as v09 } from './vorlesung-09.js';

export const ANTWORTEN = [...grundlagen, ...glieder, ...sps, ...python,
  ...v01, ...v02, ...v03, ...v04, ...v05, ...v06, ...v07, ...v08, ...v09];
