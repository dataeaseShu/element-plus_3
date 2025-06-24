import { useSizeProp } from '@element-plus/hooks'
import { buildProps, definePropType, iconPropType } from '@element-plus/utils'
import { type Component, type ExtractPropTypes, h } from 'vue'

const Loading = h(
  'svg',
  {
    width: '14',
    height: '14',
    viewBox: '0 0 14 14',
    xmlns: 'http://www.w3.org/2000/svg',
  },
  [
    h('path', {
      d: 'M3.11482 3.07408L3.11482 3.07408C2.0868 4.10277 1.49805 5.49657 1.49805 6.98244C1.49805 10.0309 3.96132 12.5023 7.00039 12.5023C10.0395 12.5023 12.5027 10.0309 12.5027 6.98244C12.5027 6.82269 12.4393 6.66948 12.3263 6.55652C12.2133 6.44356 12.0601 6.3801 11.9004 6.3801C11.7406 6.3801 11.5874 6.44356 11.4745 6.55652C11.3615 6.66948 11.298 6.82269 11.298 6.98244C11.298 9.36597 9.37379 11.2976 7.00039 11.2976C4.62699 11.2976 2.70273 9.36597 2.70273 6.98244M3.11482 3.07408L2.80039 6.98244M3.11482 3.07408C3.17075 3.01811 3.23715 2.97371 3.31024 2.9434C3.38332 2.9131 3.46166 2.89749 3.54078 2.89746C3.6199 2.89743 3.69825 2.91299 3.77136 2.94324C3.84446 2.97349 3.9109 3.01785 3.96686 3.07377C4.02283 3.1297 4.06723 3.1961 4.09753 3.26918C4.12784 3.34227 4.14345 3.42061 4.14348 3.49973C4.14351 3.57885 4.12795 3.6572 4.0977 3.7303C4.06746 3.80338 4.02312 3.8698 3.96723 3.92575M3.11482 3.07408L4.03625 3.99484M2.70273 6.98244H2.80039M2.70273 6.98244C2.70273 6.9825 2.70273 6.98256 2.70273 6.98262L2.80039 6.98244M2.70273 6.98244C2.70172 6.41478 2.8129 5.85252 3.02989 5.32796C3.24689 4.80336 3.56544 4.32683 3.96723 3.92575M2.80039 6.98244C2.79938 6.42759 2.90804 5.87801 3.12013 5.36529C3.33222 4.85257 3.64356 4.38683 4.03625 3.99484M3.96723 3.92575C3.96721 3.92577 3.96719 3.92579 3.96717 3.92581L4.03625 3.99484M3.96723 3.92575C3.96723 3.92574 3.96724 3.92573 3.96725 3.92572L4.03625 3.99484',
    }),
  ]
)

export const buttonTypes = [
  'default',
  'primary',
  'success',
  'warning',
  'info',
  'danger',
  /**
   * @deprecated
   * Text type will be deprecated in the next major version (3.0.0)
   */
  'text',
  '',
] as const
export const buttonNativeTypes = ['button', 'submit', 'reset'] as const

export const buttonProps = buildProps({
  /**
   * @description button size
   */
  size: useSizeProp,
  /**
   * @description disable the button
   */
  disabled: Boolean,
  /**
   * @description button type
   */
  type: {
    type: String,
    values: buttonTypes,
    default: '',
  },
  /**
   * @description icon component
   */
  icon: {
    type: iconPropType,
  },
  /**
   * @description native button type
   */
  nativeType: {
    type: String,
    values: buttonNativeTypes,
    default: 'button',
  },
  secondary: Boolean,
  /**
   * @description determine whether it's loading
   */
  loading: Boolean,
  /**
   * @description customize loading icon component
   */
  loadingIcon: {
    type: iconPropType,
    default: () => Loading,
  },
  /**
   * @description determine whether it's a plain button
   */
  plain: Boolean,
  /**
   * @description determine whether it's a text button
   */
  text: Boolean,
  /**
   * @description determine whether it's a link button
   */
  link: Boolean,
  /**
   * @description determine whether the text button background color is always on
   */
  bg: Boolean,
  /**
   * @description native button autofocus
   */
  autofocus: Boolean,
  /**
   * @description determine whether it's a round button
   */
  round: Boolean,
  /**
   * @description determine whether it's a circle button
   */
  circle: Boolean,
  /**
   * @description custom button color, automatically calculate `hover` and `active` color
   */
  color: String,
  /**
   * @description dark mode, which automatically converts `color` to dark mode colors
   */
  dark: Boolean,
  /**
   * @description automatically insert a space between two chinese characters
   */
  autoInsertSpace: {
    type: Boolean,
    default: undefined,
  },
  /**
   * @description custom element tag
   */
  tag: {
    type: definePropType<string | Component>([String, Object]),
    default: 'button',
  },
} as const)
export const buttonEmits = {
  click: (evt: MouseEvent) => evt instanceof MouseEvent,
}

export type ButtonProps = ExtractPropTypes<typeof buttonProps>
export type ButtonEmits = typeof buttonEmits

export type ButtonType = ButtonProps['type']
export type ButtonNativeType = ButtonProps['nativeType']

export interface ButtonConfigContext {
  autoInsertSpace?: boolean
}
