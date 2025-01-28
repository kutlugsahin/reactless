import { useContext, useMemo } from 'react';

import { Context } from '../../context/context';
import { ComponentProps, Injector } from '../../provider/defaultInjectables';
import type { ConnectedProps, Constructor, WithoutLifeCycles } from '../../types';
import { bindMethods } from '../../utils/object';
import { registerServices } from '../../utils/registerServices';
import { useConnectedProps } from '../../utils/useConnectedProps';
import { useHandleLifecycle } from '../../utils/useHandleLifecycle';
import { useMappedObservableProps } from '../../utils/useObservableMappedProps';

export function useViewModel<T extends Constructor, P extends object>(
	service: T,
	props?: P
): WithoutLifeCycles<ConnectedProps<InstanceType<T>>> {
	const parentContainer = useContext(Context);

	const mappedProps = useMappedObservableProps(props ?? {});

	const { container, instance, resolvedServices } = useMemo(() => {
		const container = parentContainer.createChildContainer();

		container.register(Injector, {
			useValue: new Injector(container),
		});

		container.register(ComponentProps, {
			useValue: mappedProps,
		});

		const resolvedServices = registerServices(container, [service]);

		const instance = bindMethods(container.resolve<InstanceType<T>>(service));

		return {
			instance,
			container,
			resolvedServices,
		};
	}, []);

	useHandleLifecycle(container, resolvedServices);

	return useConnectedProps(instance);
}
