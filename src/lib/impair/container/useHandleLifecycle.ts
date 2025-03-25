import { useEffect } from 'react'
import type { DependencyContainer } from 'tsyringe'

import type { Dispose, ServiceInstance } from '../types'
import { isMounted, onMountMetadataKey, onUnmountMetadataKey } from '../utils/symbols'

export function useHandleLifecycle(container: DependencyContainer, resolvedServices: Set<ServiceInstance>) {
  useEffect(() => {
    const disposers = [...resolvedServices].map((service) => {
      if (!service[isMounted]) {
        service[isMounted] = true

        const onMounts: (() => Dispose)[] = Reflect.getMetadata(onMountMetadataKey, service) ?? []

        const onMountDisposers = onMounts.map((onMount) => onMount())

        return () => {
          if (service[isMounted]) {
            service[isMounted] = false
            const onUnmounts: Dispose[] = Reflect.getMetadata(onUnmountMetadataKey, service) ?? []
            onUnmounts.concat(onMountDisposers).forEach((dispose) => dispose())
          }
        }
      }
    })

    return () => {
      disposers.forEach((dispose) => {
        dispose?.()
      })
      container.dispose()
    }
  }, [container])

  return resolvedServices
}
