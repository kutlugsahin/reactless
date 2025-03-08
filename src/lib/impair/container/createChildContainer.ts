import { DependencyContainer, InjectionToken } from 'tsyringe'

import { injectableMetadataKey } from '../utils/symbols'
import { initInstance } from './initInstance'

export function createChildContainer(parentContainer: DependencyContainer): DependencyContainer {
  const container = parentContainer.createChildContainer()

  const resolve = container.resolve as any

  container.resolve = function (...args: any[]) {
    const token = args[0]
    const isInjectable = typeof token === 'function' && Reflect.getMetadata(injectableMetadataKey, token)

    if (isInjectable) {
      container.afterResolution(
        token as InjectionToken,
        (_, instance) => {
          initInstance(instance)
        },
        {
          frequency: 'Once',
        },
      )
    }

    return resolve.call(container, ...args)
  }

  return container
}
