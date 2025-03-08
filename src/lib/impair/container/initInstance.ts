import { initState } from '../reactivity'
import { initDerived } from '../reactivity/derived'
import { initTrigger } from '../reactivity/trigger'
import { Dictionary, Dispose } from '../types'
import { bindMethods, patchClassInstanceMethod } from '../utils/object'
import { isInitialized } from '../utils/symbols'

export function initInstance<T extends Dictionary>(instance: T) {
  if (!(instance as any)[isInitialized]) {
    try {
      const disposers: Dispose[] = []
      ;(instance as any)[isInitialized] = true

      patchClassInstanceMethod(instance, 'onUnmount', function dispose() {
        disposers.forEach((dispose) => {
          dispose()
        })
      })

      const params = {
        instance,
        disposers,
      }

      initState(params)
      initDerived(params)
      initTrigger(params)
      bindMethods(instance)
      instance.init?.()
    } catch {
      console.error('Impair Error initializing instance', instance)
      ;(instance as any)[isInitialized] = false
    }
  }

  return instance
}
