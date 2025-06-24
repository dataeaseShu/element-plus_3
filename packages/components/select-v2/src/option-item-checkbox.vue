<template>
  <li
    :aria-selected="selected"
    :style="style"
    :class="[
      ns.be('dropdown', 'item'),
      ns.is('selected', selected),
      ns.is('disabled', disabled),
      ns.is('created', created),
      ns.is('hovering', hovering),
      ns.be('dropdown', 'item-checkbox'),
    ]"
    @mousemove="hoverItem"
    @click.stop="
      () => {
        item.checked = !item.checked
        onSelectCheckbox(index)
      }
    "
  >
    <slot :item="item" :index="index" :disabled="disabled">
      <el-checkbox
        :title="item.label"
        @click.stop
        @change="onSelectCheckbox(index)"
        v-model="item.checked"
      >
        <span v-html="replaceFun(item.label)"></span>
      </el-checkbox>
    </slot>
  </li>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent, inject } from 'vue'
import { useNamespace } from '@element-plus/hooks'
import { useOption } from './useOption'
import { OptionProps } from './defaults'
import { ElCheckbox } from '@element-plus/components/checkbox'
export default defineComponent({
  props: OptionProps,
  components: {
    ElCheckbox,
  },
  emits: ['select', 'hover'],
  setup(props, { emit }) {
    const displayInputValue = inject('displayInputValue')
    const ns = useNamespace('select')
    const onSelectCheckbox = (index: number) => {
      emit('select', index)
    }

    const replaceFun = (label: string) => {
      return label.replace(
        displayInputValue.value,
        `<span style="color: #3370FF;">${displayInputValue.value}</span>`
      )
    }
    const { hoverItem, selectOptionClick } = useOption(props, { emit })
    return {
      ns,
      hoverItem,
      replaceFun,
      onSelectCheckbox,
      selectOptionClick,
    }
  },
})
</script>
