import { computed, getCurrentInstance, inject, ref, unref } from 'vue'
import { debugWarn, isClient, isNumber } from '@element-plus/utils'

import type { InjectionKey, Ref } from 'vue'

export interface ElZIndexInjectionContext {
  current: number
}

if (!window._de_elZIndexContextKey_initial) {
  window._de_elZIndexContextKey_initial = 0
}

const initial: ElZIndexInjectionContext = {
  current: window._de_elZIndexContextKey_initial || 0,
}

const zIndex = ref(window._de_elZIndexContextKey_initial || 0)

export const defaultInitialZIndex = 2000
if (!window._de_elZIndexContextKey) {
  window._de_elZIndexContextKey = Symbol('elZIndexContextKey')
}
if (!window._de_zIndexContextKey) {
  window._de_zIndexContextKey = Symbol('zIndexContextKey')
}
// For SSR
export const ZINDEX_INJECTION_KEY: InjectionKey<ElZIndexInjectionContext> =
  window._de_elZIndexContextKey

export const zIndexContextKey: InjectionKey<Ref<number | undefined>> =
  window._de_zIndexContextKey

export const useZIndex = (zIndexOverrides?: Ref<number>) => {
  const increasingInjection = getCurrentInstance()
    ? inject(ZINDEX_INJECTION_KEY, initial)
    : initial

  const zIndexInjection =
    zIndexOverrides ||
    (getCurrentInstance() ? inject(zIndexContextKey, undefined) : undefined)

  const initialZIndex = computed(() => {
    const zIndexFromInjection = unref(zIndexInjection)
    return isNumber(zIndexFromInjection)
      ? zIndexFromInjection
      : defaultInitialZIndex
  })

  const currentZIndex = computed(() => initialZIndex.value + zIndex.value)

  const nextZIndex = () => {
    increasingInjection.current++
    zIndex.value = increasingInjection.current
    window._de_elZIndexContextKey_initial = increasingInjection.current
    return currentZIndex.value
  }

  if (!isClient && !inject(ZINDEX_INJECTION_KEY)) {
    debugWarn(
      'ZIndexInjection',
      `Looks like you are using server rendering, you must provide a z-index provider to ensure the hydration process to be succeed
usage: app.provide(ZINDEX_INJECTION_KEY, { current: 0 })`
    )
  }

  return {
    initialZIndex,
    currentZIndex,
    nextZIndex,
  }
}

export type UseZIndexReturn = ReturnType<typeof useZIndex>
