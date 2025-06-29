import type { vShow } from 'vue'
import type { INSTALLED_KEY } from '@element-plus/constants'

declare global {
  const process: {
    env: {
      NODE_ENV: string
    }
  }

  interface Window {
    _de_iner_symbol_: symbol
    _de_elZIndexContextKey: symbol
    _de_zIndexContextKey: symbol
    _de_elZIndexContextKey_initial: number
  }

  namespace JSX {
    interface IntrinsicAttributes {
      class?: unknown
      style?: unknown
    }
  }
}

declare module '@vue/runtime-core' {
  export interface App {
    [INSTALLED_KEY]?: boolean
  }

  export interface GlobalComponents {
    Component: (props: { is: Component | string }) => void
  }

  export interface ComponentCustomProperties {
    vShow: typeof vShow
  }
}

export {}
