import { defineComponent, inject, renderSlot } from 'vue'
import { useNamespace } from '@element-plus/hooks'
import { ROOT_PICKER_INJECTION_KEY } from '../constants'
import { basicCellProps } from '../props/basic-cell'
import { formatterStyle, type CustomStyle } from '@element-plus/utils'

export default defineComponent({
  name: 'ElDatePickerCell',
  props: basicCellProps,
  setup(props) {
    const ns = useNamespace('date-table-cell')
    const customStyle = inject('$custom-style-filter', {}) as CustomStyle
    const { slots } = inject(ROOT_PICKER_INJECTION_KEY)!
    return () => {
      const { cell } = props
      return renderSlot(slots, 'default', { ...cell }, () => [
        <div class={ns.b()}>
          <span class={ns.e('text')} style={[cell!.inRange ? {} : formatterStyle(customStyle, ['text'])]}>{cell?.renderText ?? cell?.text}</span>
        </div>,
      ])
    }
  },
})
