import { useContext, useMemo } from 'react'

import { Context } from '../../context/context'
import type { ClassInstances, ConnectedProps, Constructor } from '../../types'
import { bindMethods } from '../../utils/object'
import { useConnectedProps } from '../../utils/useConnectedProps'

export function useServices<T extends readonly Constructor[], C extends (...args: ClassInstances<T>) => any>(
  services: T,
  connector: C,
) {
  const container = useContext(Context)

  const connect = useMemo(() => {
    const serviceInstances = services.map((service) => bindMethods(container.resolve(service))) as ClassInstances<T>

    return connector(...serviceInstances)
  }, [])

  return useConnectedProps(connect) as ConnectedProps<ReturnType<C>>
}
