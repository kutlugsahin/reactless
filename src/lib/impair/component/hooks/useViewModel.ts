import { MutableRefObject, useContext } from 'react'
import { DependencyContainer } from 'tsyringe'
import { Context } from '../../context/context'
import { Constructor } from '../../types'
import { useRegisteredContainer } from '../../container/useRegisteredContainer'
import { createChildContainer } from '../../container/createChildContainer'

let currentComponentContainerRef: MutableRefObject<DependencyContainer | undefined>

export function setCurrentComponentContainerRef(containerRef: MutableRefObject<DependencyContainer | undefined>) {
  currentComponentContainerRef = containerRef
}

export function useViewModel<T extends Constructor, P extends object>(viewModel: T, props?: P): InstanceType<T> {
  const container = useContext(Context)

  if (currentComponentContainerRef && !currentComponentContainerRef.current) {
    currentComponentContainerRef.current = createChildContainer(container)
  }

  const componentContainer = currentComponentContainerRef.current!

  useRegisteredContainer(props, [viewModel], componentContainer)

  const instance = componentContainer.resolve<InstanceType<T>>(viewModel)

  return instance
}
