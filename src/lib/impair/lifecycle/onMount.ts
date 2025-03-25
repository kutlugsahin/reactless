import { onMountMetadataKey } from '../utils/symbols'

export function onMount(target: any, propertyKey: string) {
  const onMounts: string[] = Reflect.getMetadata(onMountMetadataKey, target) ?? []
  onMounts.push(propertyKey)
  Reflect.metadata(onMountMetadataKey, onMounts)(target)
}
