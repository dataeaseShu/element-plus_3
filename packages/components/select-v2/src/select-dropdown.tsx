import {
  computed,
  defineComponent,
  inject,
  ref,
  toRaw,
  unref,
  watch,
  nextTick,
} from 'vue'
import { get } from 'lodash-unified'
import { isObject, isUndefined, formatterStyle, type CustomStyle  } from '@element-plus/utils'
import type { CheckboxValueType } from '@element-plus/components/checkbox'
import {
  DynamicSizeList,
  FixedSizeList,
} from '@element-plus/components/virtual-list'
import {
  ElCheckbox,
} from '@element-plus/components/checkbox'
import { useNamespace,useLocale } from '@element-plus/hooks'
import { EVENT_CODE } from '@element-plus/constants'
import GroupItem from './group-item.vue'
import OptionItem from './option-item.vue'
import { useProps } from './useProps'
import OptionItemCheckbox from './option-item-checkbox.vue'

import { selectV2InjectionKey } from './token'

import type {
  DynamicSizeListInstance,
  FixedSizeListInstance,
  ItemProps,
} from '@element-plus/components/virtual-list'
import type { Option, OptionItemProps } from './select.types'
import type {
  ComponentPublicInstance,
  ComputedRef,
  ExtractPropTypes,
  Ref,
} from 'vue'

const props = {
  loading: Boolean,
  data: {
    type: Array,
    required: true as const,
  },
  hoveringIndex: Number,
  width: Number,
}
interface SelectDropdownExposed {
  listRef: Ref<FixedSizeListInstance | DynamicSizeListInstance | undefined>
  isSized: ComputedRef<boolean>
  isItemDisabled: (modelValue: any[] | any, selected: boolean) => boolean
  isItemHovering: (target: number) => boolean
  isItemSelected: (modelValue: any[] | any, target: Option) => boolean
  scrollToItem: (index: number) => void
  resetScrollTop: () => void
}
export type SelectDropdownInstance = ComponentPublicInstance<
  ExtractPropTypes<typeof props>,
  SelectDropdownExposed
>
export default defineComponent({
  name: 'ElSelectDropdown',
  props,
  setup(props, { slots, expose, emit }) {
    const select = inject(selectV2InjectionKey)!
    const ns = useNamespace('select')
    const { getLabel, getValue, getDisabled } = useProps(select.props)
    const { t } = useLocale()

    const cachedHeights = ref<Array<number>>([])

    const listRef = ref<FixedSizeListInstance | DynamicSizeListInstance>()
    const { props: { modelValue, showChecked, valueKey } } = select
    const checkAll = ref(false)
    const isIndeterminate = ref(false)
    const customStyle = inject('$custom-style-filter', {}) as CustomStyle

    const size = computed(() => props.data.length)
    watch(
      () => size.value,
      () => {
        if (showChecked) {
          setCheckStatus()
        }
        select.tooltipRef.value!.updatePopper?.()
      }
    )

    watch(
      () => select.props.modelValue,
      (val) => {
        if (showChecked) {
          props.data.forEach((element: any) => {
            element.checked = val.includes(get(element, valueKey))
          });
          const checkedCount = val.length
          checkAll.value = checkedCount === size.value
          isIndeterminate.value = checkedCount > 0 && checkedCount < size.value
        }
      },
      { deep: true }
    )

    const onSelectCheckbox = (index: number) => {
      select.onHover(index - 1)
      nextTick(() => {
        select.onHover(index)
        setCheckStatus()
      })
    }

    const handleCheckAllChange = (val: CheckboxValueType) => {
      checkAll.value = val as boolean
      props.data.forEach((element: any) => {
        element.checked = val
      });
      isIndeterminate.value = false
      onSelectCheckbox(0)
    }

    if (showChecked) {
      props.data.forEach((element: any) => {
        element.checked = modelValue.includes(get(element, valueKey))
      });
      const checkedCount = modelValue.length
      checkAll.value = checkedCount === size.value
      isIndeterminate.value = checkedCount > 0 && checkedCount < size.value
    }

    const setCheckStatus = () => {
      const checkedCount = props.data.filter((ele: any) => ele.checked).length
      checkAll.value = checkedCount === size.value
      isIndeterminate.value = checkedCount > 0 && checkedCount < size.value
    }

    const confirm = (event: Event) => {
      emit('confirmChecked', (select.props.options || []).filter((ele: any) => ele.checked) as Option[], event)
    }

    const clear = () => {
      handleCheckAllChange(false)
    }

    const isSized = computed(() =>
      isUndefined(select.props.estimatedOptionHeight)
    )
    const listProps = computed(() => {
      if (isSized.value) {
        return {
          itemSize: select.props.itemHeight,
        }
      }

      return {
        estimatedSize: select.props.estimatedOptionHeight,
        itemSize: (idx: number) => cachedHeights.value[idx],
      }
    })

    const contains = (arr: Array<any> = [], target: any) => {
      const {
        props: { valueKey },
      } = select

      if (!isObject(target)) {
        return arr.includes(target)
      }

      return (
        arr &&
        arr.some((item) => {
          return toRaw(get(item, valueKey)) === get(target, valueKey)
        })
      )
    }
    const isEqual = (selected: unknown, target: unknown) => {
      if (!isObject(target)) {
        return selected === target
      } else {
        const { valueKey } = select.props
        return get(selected, valueKey) === get(target, valueKey)
      }
    }

    const isItemSelected: SelectDropdownExposed['isItemSelected'] = (
      modelValue,
      target
    ) => {
      if (select.props.multiple) {
        return contains(modelValue, getValue(target))
      }
      return isEqual(modelValue, getValue(target))
    }

    const isItemDisabled: SelectDropdownExposed['isItemDisabled'] = (
      modelValue,
      selected
    ) => {
      const { disabled, multiple, multipleLimit } = select.props
      return (
        disabled ||
        (!selected &&
          (multiple
            ? multipleLimit > 0 && modelValue.length >= multipleLimit
            : false))
      )
    }

    const isItemHovering: SelectDropdownExposed['isItemHovering'] = (target) =>
      props.hoveringIndex === target

    const scrollToItem: SelectDropdownExposed['scrollToItem'] = (index) => {
      const list = listRef.value
      if (list) {
        list.scrollToItem(index)
      }
    }

    const resetScrollTop: SelectDropdownExposed['resetScrollTop'] = () => {
      const list = listRef.value
      if (list) {
        list.resetScrollTop()
      }
    }
    const exposed: SelectDropdownExposed = {
      listRef,
      isSized,

      isItemDisabled,
      isItemHovering,
      isItemSelected,
      scrollToItem,
      resetScrollTop,
    }
    expose(exposed)

    const Item = (itemProps: ItemProps<any>) => {
      const { index, data, style } = itemProps
      const sized = unref(isSized)
      const { itemSize, estimatedSize } = unref(listProps)
      const { modelValue } = select.props
      const { onSelect, onHover } = select
      const item = data[index]
      if (item.type === 'Group') {
        return (
          <GroupItem
            item={item}
            style={style}
            height={sized ? (itemSize as number) : estimatedSize}
          />
        )
      }

      const isSelected = isItemSelected(modelValue, item)
      const isDisabled = isItemDisabled(modelValue, isSelected)
      const isHovering = isItemHovering(index)

      if (showChecked) {
        return (<OptionItemCheckbox
          {...itemProps}
          disabled={item.disabled || isDisabled}
          created={!!item.created}
          hovering={isHovering}
          item={item}
          onSelect={onSelectCheckbox}
          onHover={onHover}
        >
          {{
            default: (props: OptionItemProps) =>
              slots.default?.(props) || <span>{item.label}</span>,
          }}
        </OptionItemCheckbox>)
      }

      return (
        <OptionItem
          {...itemProps}
          selected={isSelected}
          disabled={getDisabled(item) || isDisabled}
          created={!!item.created}
          hovering={isHovering}
          item={item}
          onSelect={onSelect}
          onHover={onHover}
        >
          {{
            default: (props: OptionItemProps) =>
              slots.default?.(props) || <span>{getLabel(item)}</span>,
          }}
        </OptionItem>
      )
    }

    // computed
    const { onKeyboardNavigate, onKeyboardSelect } = select

    const onForward = () => {
      onKeyboardNavigate('forward')
    }

    const onBackward = () => {
      onKeyboardNavigate('backward')
    }

    const onEscOrTab = () => {
      // The following line actually doesn't work. Fixing it may introduce a small breaking change for some users, so just comment it out for now.
      // select.expanded = false
    }

    const onKeydown = (e: KeyboardEvent) => {
      const { code } = e
      const { tab, esc, down, up, enter, numpadEnter } = EVENT_CODE
      if ([esc, down, up, enter, numpadEnter].includes(code)) {
        e.preventDefault()
        e.stopPropagation()
      }

      switch (code) {
        case tab:
        case esc:
          onEscOrTab()
          break
        case down:
          onForward()
          break
        case up:
          onBackward()
          break
        case enter:
        case numpadEnter:
          onKeyboardSelect()
          break
      }
    }

    return () => {
      const { data, width } = props
      const { height, multiple, scrollbarAlwaysOn } = select.props

      const List = unref(isSized) ? FixedSizeList : DynamicSizeList

      return (
        <div
          class={[ns.b('dropdown'), ns.is('multiple', multiple)]}
          style={{
            width: `${width}px`,
          }}
        >
          {slots.header?.()}
          { showChecked ?  <div class={[ns.b('dropdown__item'),ns.be('dropdown', 'item-checkbox')]}>
          <ElCheckbox
            modelValue={checkAll.value}
            indeterminate={isIndeterminate.value}
            onChange={handleCheckAllChange}
            >{ t('el.colorpicker.selectAll')}</ElCheckbox>
          </div> : null}
          {slots.loading?.() || slots.empty?.() || (
            <List
              ref={listRef}
              {...unref(listProps)}
              className={`${ns.be('dropdown', 'list')} ${showChecked && ns.be('dropdown', 'list-checkbox')}`}
              scrollbarAlwaysOn={scrollbarAlwaysOn}
              data={data}
              height={height}
              width={width}
              total={data.length}
              // @ts-ignore - dts problem
              onKeydown={onKeydown}
            >
              {{
                default: (props: ItemProps<any>) => <Item {...props} />,
              }}
            </List>
          )}
          { showChecked ?  <div class={[ns.b('btn-group')]} style={formatterStyle(customStyle, ['border'])}>
            <div onClick={clear} class={[ns.b('btn')]} style={{ color: '#000000', background: '#ffffff' }}>
              { t('el.datepicker.clear')}
            </div>
            <div onClick={confirm} class={[ns.b('btn')]}  style={{ color: '#ffffff', background: '#3370FF'}}>
              { t('el.datepicker.confirm') }
            </div>
          </div> : null}
          {slots.footer?.()}
        </div>
      )
    }
  },
})
