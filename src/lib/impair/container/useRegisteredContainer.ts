import { useContext, useMemo } from 'react';
import { Context } from '../context/context';
import { Container } from '../injectables/container';
import { Props } from '../injectables/tokens';
import { registerServices } from './registerServices';
import { useHandleLifecycle } from './useHandleLifecycle';
import { useReactiveProps } from '../utils/useReactiveProps';
import { ProviderProps } from '../types';
import { useTranslation } from 'react-i18next';

export function useRegisteredContainer<P>(props: P, services: ProviderProps<any>['provide']) {
	const parentContainer = useContext(Context);

	const mappedProps = useReactiveProps(props ?? {});

	const { t } = useTranslation();

	const { container, resolvedServices } = useMemo(() => {
		const container = parentContainer.createChildContainer();

		container.register(Container, {
			useValue: new Container(container),
		});

		container.register(Props, {
			useValue: mappedProps,
		});

		container.register('t', {
			useValue: t,
		});

		const resolvedServices = registerServices(container, services);

		return {
			container,
			resolvedServices,
		};
	}, []);

	useHandleLifecycle(container, resolvedServices);

	return container;
}
