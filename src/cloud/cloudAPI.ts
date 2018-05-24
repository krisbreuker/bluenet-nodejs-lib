'use strict';
import { Util } from '../util/Util';

import { appliances }        from './sections/appliances'
import { cloudApiBase }      from './sections/cloudApiBase'
import { devices }           from './sections/devices'
import { fingerprints }      from './sections/fingerprints'
import { locations }         from './sections/locations'
import { messages }          from './sections/messages'
import { stones }            from './sections/stones'
import { spheres }           from './sections/spheres'
import { schedules }         from './sections/schedules'
import { user }              from './sections/user'


function combineSections() {
  let result = {};
  Util.mixin(result, cloudApiBase);

  // mixin all modules.
  Util.mixin(result, appliances);
  Util.mixin(result, devices);
  Util.mixin(result, fingerprints);
  Util.mixin(result, locations);
  Util.mixin(result, messages);
  Util.mixin(result, schedules);
  Util.mixin(result, spheres);
  Util.mixin(result, stones);
  Util.mixin(result, user);

  return result;
}

/**
 * This adds all sections into the CLOUD
 */
export const CLOUD : any = combineSections();

