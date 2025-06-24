<template>
  <el-tooltip
    ref="popper"
    :visible="showPicker"
    :show-arrow="false"
    :fallback-placements="['bottom', 'top', 'right', 'left']"
    :offset="0"
    :gpu-acceleration="false"
    :popper-class="[ns.be('picker', 'panel'), ns.b('dropdown'), popperClass]"
    :stop-popper-mouse-event="false"
    trigger="click"
    :teleported="teleported"
    :transition="`${ns.namespace.value}-zoom-in-top`"
    persistent
    @hide="setShowPicker(false)"
  >
    <template #content>
      <div
        v-click-outside:[triggerRef]="handleClickOutside"
        @keydown.esc="handleEsc"
      >
        <div :class="ns.be('dropdown', 'main-wrapper')">
          <hue-slider ref="hue" class="hue-slider" :color="color" vertical />
          <sv-panel ref="sv" :color="color" />
        </div>
        <alpha-slider v-if="showAlpha" ref="alpha" :color="color" />
        <predefine
          v-if="predefine"
          ref="predefine"
          :enable-alpha="showAlpha"
          :color="color"
          :colors="predefine"
        />
        <div :class="ns.be('dropdown', 'btns')">
          <span :class="ns.be('dropdown', 'value')">
            <el-input
              ref="inputRef"
              v-model="customInput"
              :validate-event="false"
              size="small"
              @keyup.enter="handleConfirm"
              @blur="customInputChange"
            />
          </span>
          <el-icon size="20" @click.stop="getEyeDropper"><EditPen /></el-icon>
          <el-radio-group @change="modeChange" v-model="colorMode" size="small">
            <el-radio-button label="HEX" />
            <el-radio-button label="RGB" />
          </el-radio-group>
        </div>
      </div>
    </template>
    <template #default>
      <div
        :id="buttonId"
        ref="triggerRef"
        v-bind="$attrs"
        :class="btnKls"
        role="button"
        :aria-label="buttonAriaLabel"
        :aria-labelledby="buttonAriaLabelledby"
        :aria-description="
          t('el.colorpicker.description', { color: modelValue || '' })
        "
        :aria-disabled="colorDisabled"
        :tabindex="colorDisabled ? -1 : tabindex"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        @click="handleTriggerCustom"
        :style="customStyle"
      >
        <div v-if="colorDisabled" :class="ns.be('picker', 'mask')" />
        <div :class="ns.be('picker', 'trigger')" @click="handleTrigger">
          <span :class="[ns.be('picker', 'color'), ns.is('alpha', showAlpha)]">
            <span
              :class="ns.be('picker', 'color-inner')"
              :style="{
                backgroundColor: displayedColor,
              }"
            >
              <template v-if="!isCustom">
                <el-icon
                  v-show="modelValue || showPanelColor"
                  :class="[ns.be('picker', 'icon'), ns.is('icon-arrow-down')]"
                >
                  <arrow-down />
                </el-icon>
                <el-icon
                  v-show="!modelValue && !showPanelColor"
                  :class="[ns.be('picker', 'empty'), ns.is('icon-close')]"
                >
                  <close />
                </el-icon>
              </template>
            </span>
          </span>
        </div>
        <el-icon
          size="14"
          v-show="modelValue || showPanelColor || isCustom"
          :class="[
            ns.be('picker', 'icon'),
            ns.is('icon-arrow-down'),
            ns.is('icon-arrow-down_custom'),
          ]"
        >
          <arrow-down />
        </el-icon>
      </div>
    </template>
  </el-tooltip>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
  h,
} from 'vue'
import { debounce } from 'lodash-unified'
import { ElRadioGroup } from '@element-plus/components/radio'
import { ElRadioButton } from '@element-plus/components/radio'
import { ElIcon } from '@element-plus/components/icon'
import { ClickOutside as vClickOutside } from '@element-plus/directives'
import { ElTooltip } from '@element-plus/components/tooltip'
import { ElInput } from '@element-plus/components/input'
import {
  useFormDisabled,
  useFormItem,
  useFormItemInputId,
  useFormSize,
} from '@element-plus/components/form'
import {
  useFocusController,
  useLocale,
  useNamespace,
} from '@element-plus/hooks'
import { EVENT_CODE, UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { debugWarn } from '@element-plus/utils'
import { Close } from '@element-plus/icons-vue'
import AlphaSlider from './components/alpha-slider.vue'
import HueSlider from './components/hue-slider.vue'
import Predefine from './components/predefine.vue'
import SvPanel from './components/sv-panel.vue'
import Color from './utils/color'
import {
  colorPickerContextKey,
  colorPickerEmits,
  colorPickerProps,
} from './color-picker'
import type { TooltipInstance } from '@element-plus/components/tooltip'
import { useEyeDropper } from '@vueuse/core'

defineOptions({
  name: 'ElColorPicker',
})
const props = defineProps(colorPickerProps)
const emit = defineEmits(colorPickerEmits)

const { t } = useLocale()
const ns = useNamespace('color')
const { formItem } = useFormItem()
const colorSize = useFormSize()
const colorDisabled = useFormDisabled()
const { isSupported, open, sRGBHex } = useEyeDropper()
const customInput = ref('')

const { inputId: buttonId, isLabeledByFormItem } = useFormItemInputId(props, {
  formItemContext: formItem,
})

const hue = ref<InstanceType<typeof HueSlider>>()
const sv = ref<InstanceType<typeof SvPanel>>()
const alpha = ref<InstanceType<typeof AlphaSlider>>()
const popper = ref<TooltipInstance>()
const triggerRef = ref()
const inputRef = ref()

const showBorder = computed(() => {
  return [
    'rgb(255, 255, 255)',
    'rgba(255, 255, 255, 1)',
    '#FFFFFFFF',
    '#FFFFFF',
  ].includes(props.modelValue as string)
})
const customStyle = computed(() => {
  if (!props.isCustom) return {}
  return {
    minWidth: `${props.triggerWidth}px`,
    maxWidth: `${props.triggerWidth}px`,
  }
})
const getEyeDropper = () => {
  if (!isSupported) return
  open()
}
const colorMode = ref(props.modelValue?.startsWith('#') ? 'HEX' : 'RGB')
const modeChange = (val?: string | number | boolean) => {
  color.format = (val as string).toLowerCase()
  handleConfirm()
  customInput.value = color.value
}

watch(sRGBHex, (newValue) => {
  color.fromString(newValue)
  customInput.value = color.value
})

watch(
  () => customInput.value,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      confirmValue()
    }
  }
)

const EditPen = h(
  'svg',
  {
    width: '20',
    height: '20',
    viewBox: '0 0 20 20',
    xmlns: 'http://www.w3.org/2000/svg',
  },
  [
    h('path', {
      fill: '#ffffff',
      'fill-rule': 'evenodd',
      'clip-rule': 'evenodd',
      d: 'M14.8149 11.8272L13.4701 10.4824L7.22791 16.7246C6.92778 17.0247 6.52071 17.1933 6.09627 17.1933H4.05697C3.59673 17.1933 3.22363 16.8202 3.22363 16.36V14.3207C3.22363 13.8962 3.39224 13.4892 3.69237 13.189L9.93456 6.94686L8.92234 5.93464C8.59691 5.60921 8.59691 5.08157 8.92234 4.75613C9.24778 4.4307 9.77542 4.4307 10.1009 4.75613L11.1131 5.76835L11.2125 5.66894C11.2124 5.66904 11.2126 5.66885 11.2125 5.66894L13.241 3.64044C13.7332 3.14823 14.3796 2.90417 15.0247 2.90825C15.1093 2.90879 15.194 2.9136 15.2782 2.92268C15.8255 2.98168 16.357 3.22093 16.7765 3.64044C17.7528 4.61675 17.7528 6.19966 16.7765 7.17597L14.6486 9.30388L15.9934 10.6487C16.3188 10.9741 16.3188 11.5018 15.9934 11.8272C15.668 12.1526 15.1403 12.1526 14.8149 11.8272ZM6.06881 15.5266L12.2916 9.30388L11.1131 8.12537L4.8903 14.3481L4.8903 15.5266H6.06881Z',
    }),
  ]
)
const ArrowDown = h(
  'svg',
  {
    width: '14',
    height: '14',
    viewBox: '0 0 14 14',
    xmlns: 'http://www.w3.org/2000/svg',
  },
  [
    h('path', {
      d: 'M6.9996 9.25472L11.7431 4.51121C11.857 4.39731 12.0417 4.39731 12.1556 4.51121L12.5681 4.92369C12.682 5.03759 12.682 5.22226 12.5681 5.33617L7.41208 10.4922C7.18427 10.72 6.81492 10.72 6.58712 10.4922L1.43113 5.33617C1.31723 5.22226 1.31723 5.03759 1.43113 4.92369L1.84361 4.51121C1.95751 4.39731 2.14219 4.39731 2.25609 4.51121L6.9996 9.25472Z',
    }),
  ]
)
const { isFocused, handleFocus, handleBlur } = useFocusController(triggerRef, {
  beforeFocus() {
    return colorDisabled.value
  },
  beforeBlur(event) {
    return popper.value?.isFocusInsideContent(event)
  },
  afterBlur() {
    setShowPicker(false)
    resetColor()
  },
})

// active-change is used to prevent modelValue changes from triggering.
let shouldActiveChange = true

const color = reactive(
  new Color({
    enableAlpha: props.showAlpha,
    format: props.colorFormat || '',
    value: props.modelValue,
  })
) as Color

const showPicker = ref(false)
const showPanelColor = ref(false)

const displayedColor = computed(() => {
  if (!props.modelValue && !showPanelColor.value) {
    return 'transparent'
  }
  return displayedRgb(color, props.showAlpha)
})

const currentColor = computed(() => {
  return !props.modelValue && !showPanelColor.value ? '' : color.value
})

const buttonAriaLabel = computed<string | undefined>(() => {
  return !isLabeledByFormItem.value
    ? props.ariaLabel || t('el.colorpicker.defaultLabel')
    : undefined
})

const buttonAriaLabelledby = computed<string | undefined>(() => {
  return isLabeledByFormItem.value ? formItem?.labelId : undefined
})

const btnKls = computed(() => {
  return [
    ns.b('picker'),
    ns.is('disabled', colorDisabled.value),
    ns.bm('picker', colorSize.value || 'default'),
    ns.bm('picker', props.effect),
    ns.is('focused', isFocused.value),
    ns.is('custom', props.isCustom),
    ns.is('show-border', showBorder.value),
  ]
})

function displayedRgb(color: Color, showAlpha: boolean) {
  if (!(color instanceof Color)) {
    throw new TypeError('color should be instance of _color Class')
  }

  const { r, g, b } = color.toRgb()
  return showAlpha
    ? `rgba(${r}, ${g}, ${b}, ${color.get('alpha') / 100})`
    : `rgb(${r}, ${g}, ${b})`
}

function setShowPicker(value: boolean) {
  showPicker.value = value
}

function customInputChange() {
  handleConfirm()
  customInput.value = color.value
  confirmValue()
}

const debounceSetShowPicker = debounce(setShowPicker, 100, { leading: true })
function show() {
  if (colorDisabled.value) return
  setShowPicker(true)
}

function hide() {
  debounceSetShowPicker(false)
  resetColor()
}

function resetColor() {
  nextTick(() => {
    if (props.modelValue) {
      color.fromString(props.modelValue)
    } else {
      color.value = ''
      nextTick(() => {
        showPanelColor.value = false
      })
    }
  })
}

function handleTrigger() {
  if (colorDisabled.value || props.isCustom) return
  if (showPicker.value) {
    resetColor()
  }
  debounceSetShowPicker(!showPicker.value)
}

function handleTriggerCustom() {
  if (colorDisabled.value || !props.isCustom) return
  if (showPicker.value) {
    resetColor()
  }
  debounceSetShowPicker(!showPicker.value)
}

function handleConfirm() {
  color.fromString(customInput.value)
}

function confirmValue() {
  const value = color.value
  emit(UPDATE_MODEL_EVENT, value)
  showPicker.value && emit('change', value)
  if (props.validateEvent) {
    formItem?.validate('change').catch((err) => debugWarn(err))
  }
  // debounceSetShowPicker(false)
  // // check if modelValue change, if not change, then reset color.
  // nextTick(() => {
  //   const newColor = new Color({
  //     enableAlpha: props.showAlpha,
  //     format: props.colorFormat || '',
  //     value: props.modelValue,
  //   })
  //   if (!color.compare(newColor)) {
  //     resetColor()
  //   }
  // })
}

// function clear() {
//   debounceSetShowPicker(false)
//   emit(UPDATE_MODEL_EVENT, null)
//   emit('change', null)
//   if (props.modelValue !== null && props.validateEvent) {
//     formItem?.validate('change').catch((err) => debugWarn(err))
//   }
//   resetColor()
// }

function handleClickOutside() {
  if (!showPicker.value) return
  hide()
  isFocused.value && focus()
}

function handleEsc(event: KeyboardEvent) {
  event.preventDefault()
  event.stopPropagation()
  setShowPicker(false)
  resetColor()
}

function handleKeyDown(event: KeyboardEvent) {
  switch (event.code) {
    case EVENT_CODE.enter:
    case EVENT_CODE.numpadEnter:
    case EVENT_CODE.space:
      event.preventDefault()
      event.stopPropagation()
      show()
      inputRef.value.focus()
      break
    case EVENT_CODE.esc:
      handleEsc(event)
      break
  }
}

function focus() {
  triggerRef.value.focus()
}

function blur() {
  triggerRef.value.blur()
}

onMounted(() => {
  if (props.modelValue) {
    customInput.value = currentColor.value
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      showPanelColor.value = false
    } else if (newVal && newVal !== color.value) {
      shouldActiveChange = false
      color.fromString(newVal)
    }
  }
)

watch(
  () => [props.colorFormat, props.showAlpha],
  () => {
    color.enableAlpha = props.showAlpha
    color.format = props.colorFormat || color.format
    color.doOnChange()
    emit(UPDATE_MODEL_EVENT, color.value)
  }
)

watch(
  () => currentColor.value,
  (val) => {
    customInput.value = val
    shouldActiveChange && emit('activeChange', val)
    shouldActiveChange = true
  }
)

watch(
  () => color.value,
  () => {
    if (!props.modelValue && !showPanelColor.value) {
      showPanelColor.value = true
    }
  }
)

watch(
  () => showPicker.value,
  () => {
    nextTick(() => {
      hue.value?.update()
      sv.value?.update()
      alpha.value?.update()
    })
  }
)

provide(colorPickerContextKey, {
  currentColor,
})

defineExpose({
  /**
   * @description current color object
   */
  color,
  /**
   * @description manually show ColorPicker
   */
  show,
  /**
   * @description manually hide ColorPicker
   */
  hide,
  /**
   * @description focus the input element
   */
  focus,
  /**
   * @description blur the input element
   */
  blur,
})
</script>
