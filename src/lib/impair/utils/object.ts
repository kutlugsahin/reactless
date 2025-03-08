export function getAllPropertiesAndMethods<T>(obj: T) {
  const properties = new Set<string>()

  let currentObj = obj
  while (currentObj !== null && currentObj !== Object.prototype) {
    Object.getOwnPropertyNames(currentObj).forEach((prop) => {
      if (prop !== 'constructor') {
        properties.add(prop)
      }
    })
    currentObj = Object.getPrototypeOf(currentObj)
  }

  return [...properties]
}

function getAllMethods<T>(obj: T) {
  const properties = new Set<string>()

  let currentObj = obj
  while (currentObj !== null && currentObj !== Object.prototype) {
    Object.getOwnPropertyNames(currentObj).forEach((prop) => {
      if (prop !== 'constructor' && Object.getOwnPropertyDescriptor(currentObj, prop)?.value instanceof Function) {
        properties.add(prop)
      }
    })
    currentObj = Object.getPrototypeOf(currentObj)
  }

  return [...properties]
}

export function bindMethods<T extends object>(instance: T): T {
  getAllMethods(instance).forEach((key) => {
    (instance as any)[key] = (instance as any)[key].bind(instance)
  })

  return instance
}

export function compareObjects(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false
    }

    for (let i = 0; i < obj1.length; i++) {
      if (obj1[i] !== obj2[i]) {
        return false
      }
    }

    return true
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1 as object)
    const keys2 = Object.keys(obj2 as object)

    if (keys1.length !== keys2.length) {
      return false
    }

    for (const key of keys1) {
      if ((obj1 as any)[key] !== (obj2 as any)[key]) {
        return false
      }
    }

    return true
  }

  return obj1 === obj2
}

export function patchClassInstanceMethod(instance: any, methodName: string, callback: () => void) {
  const originalMethod = instance[methodName]

  if (originalMethod) {
    const originalOnUnmount = originalMethod.bind(instance)

    instance[methodName] = function () {
      originalOnUnmount()
      callback()
    }
  } else {
    instance[methodName] = callback
  }

  return instance
}
