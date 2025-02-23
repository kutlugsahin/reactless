import { initInstance } from '@impair/container/initInstance';
import { isInitialized } from '@impair/utils/symbols';
import { createContext } from 'react';
import { container, DependencyContainer } from 'tsyringe';

export function addGlobalResolutionInterceptor(
	container: DependencyContainer,
	callback: (token: any, instance: any) => void
): void {
	const originalResolve = Object.getPrototypeOf(container).resolve;

	Object.getPrototypeOf(container).resolve = function <T>(this: DependencyContainer, target: any): T {
		const instance = originalResolve.call(this, target);
		callback(target, instance);
		return instance;
	};
}

addGlobalResolutionInterceptor(container, (token, instance) => {
	if (!instance[isInitialized]) {
		instance[isInitialized] = true;
		initInstance(instance);
	}
});

export const Context = createContext<DependencyContainer>(container);
