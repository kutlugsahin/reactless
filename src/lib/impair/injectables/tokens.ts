import type { TFunction } from 'i18next'
import type { InjectionToken } from 'tsyringe'

const providerPropsSymbol = Symbol('ProviderProps')
export const Props: InjectionToken = providerPropsSymbol

export const Translation: InjectionToken = Symbol('Translation')
export type TranslationFunction = TFunction<'translation', undefined>
