import { h } from 'vue'
import { placements } from '@popperjs/core'
import {
  useAriaProps,
  useEmptyValuesProps,
  useSizeProp,
} from '@element-plus/hooks'
import { buildProps, definePropType, iconPropType } from '@element-plus/utils'
import { useTooltipContentProps } from '@element-plus/components/tooltip'
import { tagProps } from '@element-plus/components/tag'
import { CircleClose } from '@element-plus/icons-vue'
import type {
  Options,
  Placement,
  PopperEffect,
} from '@element-plus/components/popper'
const ArrowDown = h(
  'svg',
  {
    width: '16',
    height: '16',
    viewBox: '0 0 16 16',
    xmlns: 'http://www.w3.org/2000/svg',
  },
  [
    h('path', {
      fill: '#646A73',
      d: 'M8.00066 10.5759L13.4218 5.15476C13.552 5.02459 13.763 5.02459 13.8932 5.15476L14.3646 5.62616C14.4948 5.75634 14.4948 5.96739 14.3646 6.09757L8.47206 11.9901C8.21171 12.2505 7.7896 12.2505 7.52925 11.9901L1.63669 6.09757C1.50652 5.96739 1.50652 5.75634 1.63669 5.62616L2.1081 5.15476C2.23827 5.02459 2.44933 5.02459 2.5795 5.15476L8.00066 10.5759Z',
    }),
  ]
)

export const SelectProps = buildProps({
  /**
   * @description the name attribute of select input
   */
  name: String,
  /**
   * @description native input id
   */
  id: String,
  /**
   * @description binding value
   */
  modelValue: {
    type: [Array, String, Number, Boolean, Object],
    default: undefined,
  },
  /**
   * @description the autocomplete attribute of select input
   */
  autocomplete: {
    type: String,
    default: 'off',
  },
  /**
   * @description for non-filterable Select, this prop decides if the option menu pops up when the input is focused
   */
  automaticDropdown: Boolean,
  /**
   * @description size of Input
   */
  size: useSizeProp,
  /**
   * @description tooltip theme, built-in theme: `dark` / `light`
   */
  effect: {
    type: definePropType<PopperEffect>(String),
    default: 'light',
  },
  /**
   * @description whether Select is disabled
   */
  disabled: Boolean,
  /**
   * @description whether select can be cleared
   */
  clearable: Boolean,
  /**
   * @description whether Select is filterable
   */
  filterable: Boolean,
  /**
   * @description whether creating new items is allowed. To use this, `filterable` must be true
   */
  allowCreate: Boolean,
  /**
   * @description whether Select is loading data from server
   */
  loading: Boolean,
  /**
   * @description custom class name for Select's dropdown
   */
  popperClass: {
    type: String,
    default: '',
  },
  /**
   * @description [popper.js](https://popper.js.org/docs/v2/) parameters
   */
  popperOptions: {
    type: definePropType<Partial<Options>>(Object),
    default: () => ({} as Partial<Options>),
  },
  /**
   * @description whether options are loaded from server
   */
  remote: Boolean,
  /**
   * @description displayed text while loading data from server, default is 'Loading'
   */
  loadingText: String,
  /**
   * @description displayed text when no data matches the filtering query, you can also use slot `empty`, default is 'No matching data'
   */
  noMatchText: String,
  /**
   * @description displayed text when there is no options, you can also use slot `empty`, default is 'No data'
   */
  noDataText: String,
  /**
   * @description custom remote search method
   */
  remoteMethod: Function,
  /**
   * @description custom filter method
   */
  filterMethod: Function,
  /**
   * @description whether multiple-select is activated
   */
  multiple: Boolean,
  /**
   * @description maximum number of options user can select when `multiple` is `true`. No limit when set to 0
   */
  multipleLimit: {
    type: Number,
    default: 0,
  },
  /**
   * @description placeholder, default is 'Select'
   */
  placeholder: {
    type: String,
  },
  /**
   * @description select first matching option on enter key. Use with `filterable` or `remote`
   */
  defaultFirstOption: Boolean,
  /**
   * @description when `multiple` and `filter` is true, whether to reserve current keyword after selecting an option
   */
  reserveKeyword: {
    type: Boolean,
    default: true,
  },
  /**
   * @description unique identity key name for value, required when value is an object
   */
  valueKey: {
    type: String,
    default: 'value',
  },
  /**
   * @description whether to collapse tags to a text when multiple selecting
   */
  collapseTags: Boolean,
  /**
   * @description whether show all selected tags when mouse hover text of collapse-tags. To use this, `collapse-tags` must be true
   */
  collapseTagsTooltip: Boolean,
  /**
   * @description the max tags number to be shown. To use this, `collapse-tags` must be true
   */
  maxCollapseTags: {
    type: Number,
    default: 1,
  },
  /**
   * @description whether select dropdown is teleported, if `true` it will be teleported to where `append-to` sets
   */
  teleported: useTooltipContentProps.teleported,
  /**
   * @description when select dropdown is inactive and `persistent` is `false`, select dropdown will be destroyed
   */
  persistent: {
    type: Boolean,
    default: true,
  },
  /**
   * @description custom clear icon component
   */
  clearIcon: {
    type: iconPropType,
    default: CircleClose,
  },
  /**
   * @description whether the width of the dropdown is the same as the input
   */
  fitInputWidth: Boolean,
  /**
   * @description custom suffix icon component
   */
  suffixIcon: {
    type: iconPropType,
    default: ArrowDown,
  },
  /**
   * @description tag type
   */
  // eslint-disable-next-line vue/require-prop-types
  tagType: { ...tagProps.type, default: 'info' },
  /**
   * @description tag effect
   */
  tagEffect: { ...tagProps.effect, default: 'light' },
  /**
   * @description whether to trigger form validation
   */
  validateEvent: {
    type: Boolean,
    default: true,
  },
  /**
   * @description in remote search method show suffix icon
   */
  remoteShowSuffix: Boolean,
  /**
   * @description determines whether the arrow is displayed
   */
  showArrow: {
    type: Boolean,
    default: false,
  },
  /**
   * @description offset of the dropdown
   */
  offset: {
    type: Number,
    default: 4,
  },
  /**
   * @description position of dropdown
   */
  placement: {
    type: definePropType<Placement>(String),
    values: placements,
    default: 'bottom-start',
  },
  /**
   * @description list of possible positions for dropdown
   */
  fallbackPlacements: {
    type: definePropType<Placement[]>(Array),
    default: ['bottom-start', 'top-start', 'right', 'left'],
  },
  /**
   * @description tabindex for input
   */
  tabindex: {
    type: [String, Number],
    default: 0,
  },
  /**
   * @description which element the selection dropdown appends to
   */
  appendTo: String,
  ...useEmptyValuesProps,
  ...useAriaProps(['ariaLabel']),
})
