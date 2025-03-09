import type { DependencyContainer, InjectionToken } from 'tsyringe'

import type { Constructor } from '../types'

const providerPropsSymbol = Symbol('ProviderProps')

export const ProviderProps: InjectionToken = providerPropsSymbol
export const ComponentProps: InjectionToken = providerPropsSymbol

export class Injector {
  constructor(private container: DependencyContainer) {}

  inject<T extends Constructor>(token: T) {
    return this.container.resolve<InstanceType<T>>(token)
  }
}

export const Translation: InjectionToken = Symbol('Translation')
