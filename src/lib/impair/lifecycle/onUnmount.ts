import { onUnmountMetadataKey } from '../utils/symbols'

export function onUnmount(target: any, propertyKey: string) {
  const onUnmounts: string[] = Reflect.getMetadata(onUnmountMetadataKey, target) ?? []
  onUnmounts.push(propertyKey)
  Reflect.metadata(onUnmountMetadataKey, onUnmounts)(target)
}
