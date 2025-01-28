import { DependencyContainer, Lifecycle } from 'tsyringe';

import { ProviderProps, Registration, ServiceInstance } from '../types';
import { initInstance } from './initInstance';
import { isLifecycleHandled } from '../utils/symbols';

function getRegistrationOptions(registration: ProviderProps<any>['provide'][0]): Registration {
	/**
	 * If the registration is a function,
	 * it means that it is a class to be registered as singleton
	 */
	if (typeof registration === 'function') {
		const serviceClass = registration;
		return {
			token: serviceClass,
			provider: {
				useClass: serviceClass,
			},
			options: {
				lifecycle: Lifecycle.Singleton,
			},
		};
	}

	/**
	 * The registration is a tuple of token and useClass,
	 */
	if (Array.isArray(registration)) {
		const [serviceToken, providedClass] = registration;
		return {
			token: serviceToken,
			provider: {
				useClass: providedClass,
			},
			options: {
				lifecycle: Lifecycle.Singleton,
			},
		};
	}

	/**
	 * If the registration is an object,
	 * it means that it is a custom registration
	 */
	if (typeof registration === 'object') {
		if (!registration.options) {
			return {
				...registration,
				options: {
					lifecycle: Lifecycle.Singleton,
				},
			};
		}

		return registration;
	}

	throw new Error('Invalid service provider registration');
}

export function registerServices(container: DependencyContainer, services: ProviderProps<any>['provide']) {
	const resolvedServices = new Set<ServiceInstance>();
	services.forEach((serviceInfo) => {
		const { provider, token, options } = getRegistrationOptions(serviceInfo);

		container.register(token, provider as any, options);

		container.afterResolution(
			token,
			(_, result) => {
				if (!result[isLifecycleHandled]) {
					result[isLifecycleHandled] = true;
					resolvedServices.add(result);
					initInstance(result);
				}
			},
			{ frequency: 'Once' }
		);
	});

	return resolvedServices;
}
