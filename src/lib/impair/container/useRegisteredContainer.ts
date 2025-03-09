import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DependencyContainer } from 'tsyringe'

import { createChildContainer } from '../container/createChildContainer'
import { Context } from '../context/context'
import { Container } from '../injectables/container'
import { Props, Translation } from '../injectables/tokens'
import { ProviderProps } from '../types'
import { useReactiveProps } from '../utils/useReactiveProps'
import { registerServices } from './registerServices'
import { useHandleLifecycle } from './useHandleLifecycle'

export function useRegisteredContainer<P>(
  props: P,
  services: ProviderProps<any>['provide'],
  existingContainer?: DependencyContainer,
) {
  const parentContainer = useContext(Context)

  const mappedProps = useReactiveProps(props ?? {})

  const { t } = useTranslation()

  const { container, resolvedServices } = useMemo(() => {
    const container = existingContainer ?? createChildContainer(parentContainer)

    if (!container.isRegistered(Container)) {
      container.register(Container, {
        useValue: new Container(container),
      })
    }

    if (!container.isRegistered(Props)) {
      container.register(Props, {
        useValue: mappedProps,
      })
    }

    if (!container.isRegistered(Translation)) {
      container.register(Translation, {
        useValue: t,
      })
    }

    const resolvedServices = registerServices(container, services)

    return {
      container,
      resolvedServices,
    }
  }, [existingContainer, parentContainer])

  useHandleLifecycle(container, resolvedServices)

  return container
}
