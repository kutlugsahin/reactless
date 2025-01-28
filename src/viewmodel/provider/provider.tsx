import type { PropsWithChildren } from 'react';
import { useContext, useMemo } from 'react';

import { Context } from '../context/context';
import type { ProviderProps } from '../types';
import { registerServices } from '../utils/registerServices';
import { useHandleLifecycle } from '../utils/useHandleLifecycle';
import { useMappedObservableProps } from '../utils/useObservableMappedProps';
import { Injector, ProviderProps as OptionToken } from './defaultInjectables';

export function ServiceProvider<P extends {}>({
	provide,
	children,
	props = {} as P,
}: PropsWithChildren<ProviderProps<P>>) {
	const parentContainer = useContext(Context);
	const mappedProps = useMappedObservableProps(props);

	const { container, resolvedServices } = useMemo(() => {
		const container = parentContainer.createChildContainer();

		container.register(OptionToken, {
			useValue: mappedProps,
		});

		container.register(Injector, {
			useValue: new Injector(container),
		});

		const resolvedServices = registerServices(container, provide);

		return {
			container,
			resolvedServices,
		};
	}, [parentContainer]);

	useHandleLifecycle(container, resolvedServices);

	return <Context.Provider value={container}>{children}</Context.Provider>;
}
