<template>
  <span
    ref="arrowRef"
    :class="ns.e('arrow')"
    :style="[arrowStyle, formatterStyle(customStyle, ['background'])]"
    data-popper-arrow
  />
</template>

<script lang="ts" setup>
import { inject, onBeforeUnmount, watch } from 'vue'
import { useNamespace } from '@element-plus/hooks'
import { POPPER_CONTENT_INJECTION_KEY } from './constants'
import { popperArrowProps } from './arrow'
import { formatterStyle, type CustomStyle } from '@element-plus/utils'

defineOptions({
  name: 'ElPopperArrow',
  inheritAttrs: false,
})

const props = defineProps(popperArrowProps)

const ns = useNamespace('popper')
const { arrowOffset, arrowRef, arrowStyle } = inject(
  POPPER_CONTENT_INJECTION_KEY,
  undefined
)!
const customStyle = inject('$custom-style-filter', {}) as CustomStyle

watch(
  () => props.arrowOffset,
  (val) => {
    arrowOffset.value = val
  }
)
onBeforeUnmount(() => {
  arrowRef.value = undefined
})

defineExpose({
  /**
   * @description Arrow element
   */
  arrowRef,
})
</script>
