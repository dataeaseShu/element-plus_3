<script lang="ts">
// @ts-nocheck
import {
  computed,
  defineComponent,
  h,
  onMounted,
  reactive,
  ref,
  inject,
} from 'vue'
import { pick } from 'lodash-unified'
import { useNamespace, useLocale } from '@element-plus/hooks'
import ElSelect from '@element-plus/components/select'
import ElTree from '@element-plus/components/tree'
import { useSelect } from './select'
import { useTree } from './tree'
import CacheOptions from './cache-options'
import { formatterStyle, type CustomStyle } from '@element-plus/utils'

export default defineComponent({
  name: 'ElTreeSelect',
  // disable `ElSelect` inherit current attrs
  inheritAttrs: false,
  props: {
    ...ElSelect.props,
    ...ElTree.props,
    showBtn: {
      type: Boolean,
      default: false,
    },
    /**
     * @description The cached data of the lazy node, the structure is the same as the data, used to get the label of the unloaded data
     */
    cacheData: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, context) {
    const { slots, expose, emit } = context
    const ns = useNamespace('select-tree')
    const { t } = useLocale()
    const select = ref<InstanceType<typeof ElSelect>>()
    const tree = ref<InstanceType<typeof ElTree>>()

    const key = computed(() => props.nodeKey || props.valueKey || 'value')
    const customStyle = inject('$custom-style-filter', {}) as CustomStyle

    const selectProps = useSelect(props, context, { select, tree, key })
    const { cacheOptions, ...treeProps } = useTree(props, context, {
      select,
      tree,
      key,
    })

    const clear = () => {
      emit('treeSelectClear', tree.value?.setCheckedKeys([]))
    }

    const confirm = () => {
      emit('treeSelectConfirm', tree.value?.getCheckedKeys())
      select.value.hideMenu()
    }

    // expose ElTree/ElSelect methods
    const methods = reactive({})
    expose(methods)
    onMounted(() => {
      Object.assign(methods, {
        ...pick(tree.value, [
          'filter',
          'updateKeyChildren',
          'getCheckedNodes',
          'setCheckedNodes',
          'getCheckedKeys',
          'setCheckedKeys',
          'setChecked',
          'getHalfCheckedNodes',
          'getHalfCheckedKeys',
          'getCurrentKey',
          'getCurrentNode',
          'setCurrentKey',
          'setCurrentNode',
          'getNode',
          'remove',
          'append',
          'insertBefore',
          'insertAfter',
        ]),
        ...pick(select.value, ['focus', 'blur', 'selectedLabel']),
      })
    })

    return () =>
      h(
        ElSelect,
        /**
         * 1. The `props` is processed into `Refs`, but `v-bind` and
         * render function props cannot read `Refs`, so use `reactive`
         * unwrap the `Refs` and keep reactive.
         * 2. The keyword `ref` requires `Ref`, but `reactive` broke it,
         * so use function.
         */
        reactive({
          ...selectProps,
          ref: (ref) => (select.value = ref),
        }),
        {
          ...slots,
          default: () => [
            h(CacheOptions, { data: cacheOptions.value }),
            h(
              ElTree,
              reactive({
                ...treeProps,
                showBtn: props.showBtn,
                ref: (ref) => (tree.value = ref),
              })
            ),
            props.showBtn
              ? h(
                  'div',
                  {
                    class: ns.b('btn-group'),
                    style: formatterStyle(customStyle, ['border']),
                  },
                  [
                    h(
                      'div',
                      {
                        onClick: clear,
                        class: ns.b('btn'),
                        style: { color: '#000000', background: '#ffffff' },
                      },
                      t('el.datepicker.clear')
                    ),
                    h(
                      'div',
                      {
                        onClick: confirm,
                        class: ns.b('btn'),
                        style: { color: '#ffffff', background: '#3370FF' },
                      },
                      t('el.datepicker.confirm')
                    ),
                  ]
                )
              : null,
          ],
        }
      )
  },
})
</script>
