<template>
  <div
    ref="wrapperRef"
    :class="[nsDate.is('active', isFocused), $attrs.class]"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :style="[
      ($attrs.style as CSSProperties),
      formatterStyle(customStyle, ['background']),
      customStyle.border && {
        boxShadow: `0 0 0 1px ${customStyle.border} inset`,
      },
    ]"
    @touchstart.passive="handleTouchStart"
  >
    <slot name="prefix" />
    <input
      v-bind="attrs"
      :id="id && id[0]"
      ref="inputRef"
      :name="name && name[0]"
      :placeholder="startPlaceholder"
      :value="modelValue && modelValue[0]"
      :style="formatterStyle(customStyle, ['text'])"
      :class="nsRange.b('input')"
      @input="handleStartInput"
      @change="handleStartChange"
    />
    <slot name="range-separator" />
    <input
      v-bind="attrs"
      :id="id && id[1]"
      ref="endInputRef"
      :name="name && name[1]"
      :placeholder="endPlaceholder"
      :value="modelValue && modelValue[1]"
      :style="formatterStyle(customStyle, ['text'])"
      :class="nsRange.b('input')"
      @input="handleEndInput"
      @change="handleEndChange"
    />
    <slot name="suffix" />
  </div>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue'
import { useAttrs, useFocusController, useNamespace } from '@element-plus/hooks'
import { timePickerRangeTriggerProps } from './props'
import type { CSSProperties } from 'vue'
import { formatterStyle, type CustomStyle } from '@element-plus/utils'

defineOptions({
  name: 'PickerRangeTrigger',
  inheritAttrs: false,
})

defineProps(timePickerRangeTriggerProps)
const emit = defineEmits([
  'mouseenter',
  'mouseleave',
  'click',
  'touchstart',
  'focus',
  'blur',
  'startInput',
  'endInput',
  'startChange',
  'endChange',
])

const attrs = useAttrs()
const nsDate = useNamespace('date')
const nsRange = useNamespace('range')
const customStyle = inject('$custom-style-filter', {}) as CustomStyle

const inputRef = ref<HTMLInputElement>()
const endInputRef = ref<HTMLInputElement>()

const { wrapperRef, isFocused } = useFocusController(inputRef)

const handleClick = (evt: MouseEvent) => {
  emit('click', evt)
}

const handleMouseEnter = (evt: MouseEvent) => {
  emit('mouseenter', evt)
}

const handleMouseLeave = (evt: MouseEvent) => {
  emit('mouseleave', evt)
}

const handleTouchStart = (evt: TouchEvent) => {
  emit('mouseenter', evt)
}

const handleStartInput = (evt: Event) => {
  emit('startInput', evt)
}

const handleEndInput = (evt: Event) => {
  emit('endInput', evt)
}

const handleStartChange = (evt: Event) => {
  emit('startChange', evt)
}

const handleEndChange = (evt: Event) => {
  emit('endChange', evt)
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
  endInputRef.value?.blur()
}

defineExpose({
  focus,
  blur,
})
</script>
