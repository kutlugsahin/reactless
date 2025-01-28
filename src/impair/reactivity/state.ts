import { Ref, ref, shallowRef } from '@vue/reactivity';
import { Dictionary } from '../types';
import { stateMetadataKey } from '../utils/symbols';

export function state(target: any, propertyKey: string) {
	const propNames = Reflect.getMetadata(stateMetadataKey, target) ?? [];
	propNames.push({
		propertyKey,
		isShallow: false,
	});
	return Reflect.metadata(stateMetadataKey, propNames)(target);
}

type InitParams = {
	instance: Dictionary;
};

export function initState({ instance }: InitParams) {
	const stateValueMap = new Map<string, Ref<any>>();

	const stateProperties = Reflect.getMetadata(stateMetadataKey, instance);

	if (stateProperties) {
		stateProperties.forEach(({ propertyKey, isShallow }: any) => {
			const initialValue = instance[propertyKey];

			stateValueMap.set(propertyKey, isShallow ? shallowRef(initialValue) : ref(initialValue));

			Object.defineProperty(instance, propertyKey, {
				get() {
					return stateValueMap.get(propertyKey)?.value;
				},
				set(newValue) {
					const refValue = stateValueMap.get(propertyKey);

					if (refValue) {
						refValue.value = newValue;
					} else {
						console.error(`No ref value found for ${propertyKey}`);
					}
				},
			});
		});
	}
}
