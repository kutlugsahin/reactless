import { useEffect } from 'react'
import type { DependencyContainer } from 'tsyringe'

import type { ServiceInstance } from '../types'
import { isMounted } from './symbols'

export function useHandleLifecycle(container: DependencyContainer, resolvedServices: Set<ServiceInstance>) {
  useEffect(() => {
    resolvedServices.forEach((service) => {
      if (!service[isMounted]) {
        service[isMounted] = true
        service.onMount?.()
      }
    })

    return () => {
      resolvedServices.forEach((service) => {
        if (service[isMounted]) {
          service[isMounted] = false
          service.onUnmount?.()
        }
      })
      container.dispose()
    }
  }, [container])

  return resolvedServices
}
