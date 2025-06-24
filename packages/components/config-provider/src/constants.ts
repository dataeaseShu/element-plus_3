import type { ConfigProviderProps } from './config-provider-props'
import type { InjectionKey, Ref } from 'vue'

export type ConfigProviderContext = Partial<ConfigProviderProps>
if (!window._de_iner_symbol_) {
  window._de_iner_symbol_ = Symbol()
}
export const configProviderContextKey: InjectionKey<
  Ref<ConfigProviderContext>
> = window._de_iner_symbol_
