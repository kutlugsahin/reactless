import { injectable as tInjectable } from 'tsyringe'

import { injectableMetadataKey } from '../utils/symbols'

export function injectable<T>() {
  return function (target: any) {
    tInjectable()(target)
    Reflect.metadata(injectableMetadataKey, true)(target)
  }
}
