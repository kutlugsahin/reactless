import { stateMetadataKey } from '../utils/symbols';

export function shallowState(target: any, propertyKey: string) {
	const propNames = Reflect.getMetadata(stateMetadataKey, target) ?? [];
	propNames.push({
		propertyKey,
		isShallow: false,
	});
	return Reflect.metadata(stateMetadataKey, propNames)(target);
}
