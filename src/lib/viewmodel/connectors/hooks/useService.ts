import { useContext, useMemo } from 'react'

import { Context } from '../../context/context'
import type { ConnectedProps, Connector, Constructor, WithoutLifeCycles } from '../../types'
import { bindMethods } from '../../utils/object'
import { useConnectedProps } from '../../utils/useConnectedProps'

export function useService<T extends Constructor>(service: T): WithoutLifeCycles<ConnectedProps<InstanceType<T>>>;
export function useService<T extends Constructor, C extends Connector<T>>(
	service: T,
	connector: C
): ConnectedProps<ReturnType<C>>;
export function useService<T extends Constructor, C extends Connector<T>>(service: T, connector?: C) {
  const container = useContext(Context)

  const serviceInstance = useMemo(() => {
    const instance = bindMethods(container.resolve<InstanceType<T>>(service))

    return connector ? connector(instance) : instance
  }, [])

  return useConnectedProps(serviceInstance)
}
