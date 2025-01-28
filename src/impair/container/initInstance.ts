import { initState } from '../reactivity';
import { initDerived } from '../reactivity/derived';
import { initTrigger } from '../reactivity/trigger';
import { Dictionary, Dispose } from '../types';
import { bindMethods, patchClassInstanceMethod } from '../utils/object';

export function initInstance<T extends Dictionary>(instance: T) {
	const disposers: Dispose[] = [];

	patchClassInstanceMethod(instance, 'onUnmount', function dispose() {
		disposers.forEach((dispose) => {
			dispose();
		});
	});

	const params = {
		instance,
		disposers,
	};

	initState(params);
	initDerived(params);
	initTrigger(params);

	bindMethods(instance);

	instance.init?.();

	return instance;
}
