import { initInstance } from '@impair/container/initInstance';
import { isInitialized } from '@impair/utils/symbols';
import { createContext } from 'react';
import { container, DependencyContainer } from 'tsyringe';

export function addGlobalResolutionInterceptor(
	container: DependencyContainer,
	callback: (instance: any) => void
): void {
	const originalResolve = Object.getPrototypeOf(container).resolve;

	Object.getPrototypeOf(container).resolve = function <T>(this: DependencyContainer, ...args: any[]): T {
		const instance = originalResolve.call(this, ...args);
		callback(instance);
		return instance;
	};
}

addGlobalResolutionInterceptor(container, (instance) => {
	if (!instance[isInitialized] && typeof instance === 'object') {
		instance[isInitialized] = true;

		try {
			initInstance(instance);
		} catch (e) {
			console.error('Impair Error initializing instance', instance, e);
		}
	}
});

export const Context = createContext<DependencyContainer>(container);
