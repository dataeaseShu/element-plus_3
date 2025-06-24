<template>
  <div :class="rootKls">
    <div ref="bar" :class="barKls" :style="barStyle" @click="handleClick" />
    <div
      ref="thumb"
      :class="thumbKls"
      :style="thumbStyle"
      :aria-label="alphaLabel"
      :aria-valuenow="alpha"
      :aria-orientation="vertical ? 'vertical' : 'horizontal'"
      aria-valuemin="0"
      aria-valuemax="100"
      role="slider"
      tabindex="0"
      @keydown="handleKeydown"
    />
    <div :class="inputbKls">
      <el-input-number
        v-model="customInput"
        :min="0"
        :max="100"
        :validate-event="false"
        size="small"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { alphaSliderProps } from '../props/alpha-slider'
import { ElInputNumber } from '@element-plus/components/input-number'
import {
  useAlphaSlider,
  useAlphaSliderDOM,
} from '../composables/use-alpha-slider'

const COMPONENT_NAME = 'ElColorAlphaSlider'

defineOptions({
  name: COMPONENT_NAME,
})

const props = defineProps(alphaSliderProps)

const {
  alpha,
  alphaLabel,
  bar,
  thumb,
  handleDrag,
  handleClick,
  handleKeydown,
} = useAlphaSlider(props)

const {
  rootKls,
  barKls,
  barStyle,
  thumbKls,
  thumbStyle,
  update,
  customInput,
  inputbKls,
} = useAlphaSliderDOM(props, {
  bar,
  thumb,
  handleDrag,
})

defineExpose({
  /**
   * @description update alpha slider manually
   * @type {Function}
   */
  update,
  /**
   * @description bar element ref
   * @type {HTMLElement}
   */
  bar,
  /**
   * @description thumb element ref
   * @type {HTMLElement}
   */
  thumb,
})
</script>
