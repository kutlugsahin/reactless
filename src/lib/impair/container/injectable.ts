import { injectable as tInjectable } from 'tsyringe'

import { Constructor } from '../types'
import { injectableMetadataKey } from '../utils/symbols'

export function injectable<T extends Constructor>() {
  return function (target: T) {
    tInjectable()(target)
    Reflect.metadata(injectableMetadataKey, true)(target)
  }
}
