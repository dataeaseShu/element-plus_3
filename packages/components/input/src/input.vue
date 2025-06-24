<template>
  <div
    :class="[
      containerKls,
      {
        [nsInput.bm('group', 'append')]: $slots.append,
        [nsInput.bm('group', 'prepend')]: $slots.prepend,
      },
    ]"
    :style="containerStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- input -->
    <template v-if="type !== 'textarea'">
      <!-- prepend slot -->
      <div v-if="$slots.prepend" :class="nsInput.be('group', 'prepend')">
        <slot name="prepend" />
      </div>

      <div
        ref="wrapperRef"
        :class="wrapperKls"
        :style="[
          formatterStyle(customStyle, ['background']),
          customStyle.border && {
            boxShadow: `0 0 0 1px ${customStyle.border} inset`,
          },
        ]"
      >
        <!-- prefix slot -->
        <span v-if="$slots.prefix || prefixIcon" :class="nsInput.e('prefix')">
          <span :class="nsInput.e('prefix-inner')">
            <slot name="prefix" />
            <el-icon v-if="prefixIcon" :class="nsInput.e('icon')">
              <component :is="prefixIcon" />
            </el-icon>
          </span>
        </span>

        <input
          :id="inputId"
          ref="input"
          :class="[nsInput.e('inner'), { placeholderColor: placeholderColor }]"
          v-bind="attrs"
          :minlength="minlength"
          :maxlength="maxlength"
          :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
          :disabled="inputDisabled"
          :readonly="readonly"
          :autocomplete="autocomplete"
          :tabindex="tabindex"
          :aria-label="ariaLabel"
          :placeholder="placeholder"
          :style="[inputStyle, formatterStyle(customStyle, ['text'])]"
          :form="form"
          :autofocus="autofocus"
          :role="containerRole"
          @compositionstart="handleCompositionStart"
          @compositionupdate="handleCompositionUpdate"
          @compositionend="handleCompositionEnd"
          @input="handleInput"
          @change="handleChange"
          @keydown="handleKeydown"
        />

        <!-- suffix slot -->
        <span v-if="suffixVisible" :class="nsInput.e('suffix')">
          <span :class="nsInput.e('suffix-inner')">
            <template
              v-if="!showClear || !showPwdVisible || !isWordLimitVisible"
            >
              <slot name="suffix" />
              <el-icon v-if="suffixIcon" :class="nsInput.e('icon')">
                <component :is="suffixIcon" />
              </el-icon>
            </template>
            <el-icon
              v-if="showClear"
              :class="[nsInput.e('icon'), nsInput.e('clear')]"
              @mousedown.prevent="NOOP"
              @click="clear"
            >
              <circle-close />
            </el-icon>
            <el-icon
              v-if="showPwdVisible"
              size="16"
              :class="[nsInput.e('icon'), nsInput.e('password')]"
              @click="handlePasswordVisible"
            >
              <component :is="passwordIcon" />
            </el-icon>
            <span v-if="isWordLimitVisible" :class="nsInput.e('count')">
              <span :class="nsInput.e('count-inner')">
                {{ textLength }} / {{ maxlength }}
              </span>
            </span>
            <el-icon
              v-if="validateState && validateIcon && needStatusIcon"
              :class="[
                nsInput.e('icon'),
                nsInput.e('validateIcon'),
                nsInput.is('loading', validateState === 'validating'),
              ]"
            >
              <component :is="validateIcon" />
            </el-icon>
          </span>
        </span>
      </div>

      <!-- append slot -->
      <div v-if="$slots.append" :class="nsInput.be('group', 'append')">
        <slot name="append" />
      </div>
    </template>

    <!-- textarea -->
    <template v-else>
      <textarea
        :id="inputId"
        ref="textarea"
        :class="[nsTextarea.e('inner'), nsInput.is('focus', isFocused)]"
        v-bind="attrs"
        :minlength="minlength"
        :maxlength="maxlength"
        :tabindex="tabindex"
        :disabled="inputDisabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :style="textareaStyle"
        :aria-label="ariaLabel"
        :placeholder="placeholder"
        :form="form"
        :autofocus="autofocus"
        :rows="rows"
        :role="containerRole"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown="handleKeydown"
      />
      <span
        v-if="isWordLimitVisible"
        :style="countStyle"
        :class="nsInput.e('count')"
      >
        <span v-if="textLength" :style="{ color: '#1F2329' }">{{
          textLength
        }}</span
        ><template v-else>{{ textLength }}</template
        >/{{ maxlength }}
      </span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  toRef,
  useAttrs as useRawAttrs,
  useSlots,
  watch,
  inject,
  h,
} from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { isNil } from 'lodash-unified'
import { ElIcon } from '@element-plus/components/icon'
import { CircleClose } from '@element-plus/icons-vue'
import {
  useFormDisabled,
  useFormItem,
  useFormItemInputId,
  useFormSize,
} from '@element-plus/components/form'
import {
  NOOP,
  ValidateComponentsMap,
  debugWarn,
  isClient,
  isObject,
} from '@element-plus/utils'
import {
  useAttrs,
  useComposition,
  useCursor,
  useFocusController,
  useNamespace,
} from '@element-plus/hooks'
import { formatterStyle, type CustomStyle } from '@element-plus/utils'
import { UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { calcTextareaHeight } from './utils'
import { inputEmits, inputProps } from './input'
import type { StyleValue } from 'vue'

type TargetElement = HTMLInputElement | HTMLTextAreaElement

defineOptions({
  name: 'ElInput',
  inheritAttrs: false,
})
const props = defineProps(inputProps)
const emit = defineEmits(inputEmits)
const customStyle = inject('$custom-style-filter', {}) as CustomStyle
const placeholderColor = computed(() => {
  return customStyle.text
})
const rawAttrs = useRawAttrs()
const attrs = useAttrs()
const slots = useSlots()

const containerKls = computed(() => [
  props.type === 'textarea' ? nsTextarea.b() : nsInput.b(),
  nsInput.m(inputSize.value),
  nsInput.m(props.effect),
  nsInput.is('disabled', inputDisabled.value),
  nsInput.is('exceed', inputExceed.value),
  {
    [nsInput.b('group')]: slots.prepend || slots.append,
    [nsInput.m('prefix')]: slots.prefix || props.prefixIcon,
    [nsInput.m('suffix')]:
      slots.suffix || props.suffixIcon || props.clearable || props.showPassword,
    [nsInput.bm('suffix', 'password-clear')]:
      showClear.value && showPwdVisible.value,
    [nsInput.b('hidden')]: props.type === 'hidden',
  },
  rawAttrs.class,
])

const wrapperKls = computed(() => [
  nsInput.e('wrapper'),
  nsInput.is('focus', isFocused.value),
])

const { form: elForm, formItem: elFormItem } = useFormItem()
const { inputId } = useFormItemInputId(props, {
  formItemContext: elFormItem,
})
const inputSize = useFormSize()
const inputDisabled = useFormDisabled()
const nsInput = useNamespace('input')
const nsTextarea = useNamespace('textarea')

const input = shallowRef<HTMLInputElement>()
const textarea = shallowRef<HTMLTextAreaElement>()

const hovering = ref(false)
const passwordVisible = ref(false)
const countStyle = ref<StyleValue>()
const textareaCalcStyle = shallowRef(props.inputStyle)

const _ref = computed(() => input.value || textarea.value)

// wrapperRef for type="text", handleFocus and handleBlur for type="textarea"
const { wrapperRef, isFocused, handleFocus, handleBlur } = useFocusController(
  _ref,
  {
    beforeFocus() {
      return inputDisabled.value
    },
    afterBlur() {
      if (props.validateEvent) {
        elFormItem?.validate?.('blur').catch((err) => debugWarn(err))
      }
    },
  }
)

const needStatusIcon = computed(() => elForm?.statusIcon ?? false)
const validateState = computed(() => elFormItem?.validateState || '')
const validateIcon = computed(
  () => validateState.value && ValidateComponentsMap[validateState.value]
)
const IconHide = h(
  'svg',
  {
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    xmlns: 'http://www.w3.org/2000/svg',
  },
  [
    h('path', {
      fill: '#1F2329',
      d: 'M12.0001 15C11.3428 15 10.6996 14.9482 10.0758 14.8492L9.57779 16.7077C9.50631 16.9744 9.23215 17.1327 8.96541 17.0612L7.99949 16.8024C7.73275 16.731 7.57446 16.4568 7.64593 16.1901L8.13358 14.3701C7.31994 14.0938 6.5562 13.7328 5.85712 13.2998L4.26785 14.8891C4.07259 15.0843 3.75601 15.0843 3.56075 14.8891L2.85364 14.182C2.65838 13.9867 2.65838 13.6701 2.85364 13.4749L4.25322 12.0753C3.53111 11.3991 2.92789 10.6282 2.47193 9.78669C2.46714 9.77784 2.46219 9.76859 2.4571 9.75899C2.27015 9.40593 2.34011 8.96398 2.63539 8.69489C2.88052 8.47152 3.0537 8.31951 3.20435 8.16887C3.21782 8.15539 3.23257 8.14036 3.2483 8.12411C3.46638 7.89876 3.83829 7.98264 3.966 8.26905C5.21116 11.0613 8.19292 13 12.0001 13C15.6478 13 18.6994 11.1134 19.9241 8.52396C19.956 8.45658 19.9917 8.37172 20.0276 8.28162C20.1412 7.99633 20.5109 7.91024 20.728 8.12738C20.8886 8.28798 21.1027 8.50212 21.3704 8.76981C21.635 9.03441 21.7066 9.43852 21.5337 9.77038C21.4917 9.85109 21.4507 9.92715 21.4158 9.9876C20.9455 10.802 20.3355 11.5466 19.6128 12.1985L20.8892 13.4749C21.0844 13.6701 21.0844 13.9867 20.8892 14.182L20.1821 14.8891C19.9868 15.0843 19.6702 15.0843 19.475 14.8891L17.9829 13.397C17.3279 13.787 16.6185 14.1147 15.8666 14.3701L16.3542 16.1901C16.4257 16.4568 16.2674 16.731 16.0007 16.8024L15.0348 17.0612C14.768 17.1327 14.4939 16.9744 14.4224 16.7077L13.9244 14.8492C13.3006 14.9482 12.6574 15 12.0001 15Z',
    }),
  ]
)

const IconView = h(
  'svg',
  {
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    xmlns: 'http://www.w3.org/2000/svg',
  },
  [
    h('path', {
      fill: '#1F2329',
      d: 'M11.9847 18.5C15.2226 18.5 18.2206 16.4404 20.9999 11.987C18.2921 7.54956 15.3009 5.5 11.9847 5.5C8.66951 5.5 5.6891 7.54864 2.99989 11.987C5.76055 16.4413 8.74785 18.5 11.9847 18.5ZM1.50233 12.89C1.18033 12.3419 1.17815 11.6605 1.49271 11.1081C1.50392 11.0884 1.51466 11.0697 1.52484 11.052C4.4279 6.01734 7.91416 3.5 11.9836 3.5C16.0696 3.5 19.5775 6.03792 22.507 11.1138C22.5158 11.129 22.525 11.145 22.5346 11.1618C22.831 11.6808 22.8287 12.3215 22.5256 12.8366C19.5187 17.9455 16.0047 20.5 11.9836 20.5C7.97652 20.5 4.48276 17.9633 1.50233 12.89ZM11.9999 16C9.79075 16 7.99989 14.2091 7.99989 12C7.99989 9.79086 9.79075 8 11.9999 8C14.209 8 15.9999 9.79086 15.9999 12C15.9999 14.2091 14.209 16 11.9999 16ZM11.9999 14C13.1045 14 13.9999 13.1046 13.9999 12C13.9999 10.8954 13.1045 10 11.9999 10C10.8953 10 9.99989 10.8954 9.99989 12C9.99989 13.1046 10.8953 14 11.9999 14Z',
    }),
  ]
)
const passwordIcon = computed(() =>
  passwordVisible.value ? IconView : IconHide
)
const containerStyle = computed<StyleValue>(() => [
  rawAttrs.style as StyleValue,
])
const textareaStyle = computed<StyleValue>(() => [
  props.inputStyle,
  textareaCalcStyle.value,
  { resize: props.resize },
])
const nativeInputValue = computed(() =>
  isNil(props.modelValue) ? '' : String(props.modelValue)
)
const showClear = computed(
  () =>
    props.clearable &&
    !inputDisabled.value &&
    !props.readonly &&
    !!nativeInputValue.value &&
    (isFocused.value || hovering.value)
)
const showPwdVisible = computed(
  () =>
    props.showPassword &&
    !inputDisabled.value &&
    !!nativeInputValue.value &&
    (!!nativeInputValue.value || isFocused.value)
)
const isWordLimitVisible = computed(
  () =>
    props.showWordLimit &&
    !!props.maxlength &&
    (props.type === 'text' || props.type === 'textarea') &&
    !inputDisabled.value &&
    !props.readonly &&
    !props.showPassword
)
const textLength = computed(() => nativeInputValue.value.length)
const inputExceed = computed(
  () =>
    // show exceed style if length of initial value greater then maxlength
    !!isWordLimitVisible.value && textLength.value > Number(props.maxlength)
)
const suffixVisible = computed(
  () =>
    !!slots.suffix ||
    !!props.suffixIcon ||
    showClear.value ||
    props.showPassword ||
    isWordLimitVisible.value ||
    (!!validateState.value && needStatusIcon.value)
)

const [recordCursor, setCursor] = useCursor(input)

useResizeObserver(textarea, (entries) => {
  onceInitSizeTextarea()
  if (!isWordLimitVisible.value || props.resize !== 'both') return
  const entry = entries[0]
  const { width } = entry.contentRect
  countStyle.value = {
    /** right: 100% - width + padding(15) + right(6) */
    right: `calc(100% - ${width + 15 + 6}px)`,
  }
})

const resizeTextarea = () => {
  const { type, autosize } = props

  if (!isClient || type !== 'textarea' || !textarea.value) return

  if (autosize) {
    const minRows = isObject(autosize) ? autosize.minRows : undefined
    const maxRows = isObject(autosize) ? autosize.maxRows : undefined
    const textareaStyle = calcTextareaHeight(textarea.value, minRows, maxRows)

    // If the scrollbar is displayed, the height of the textarea needs more space than the calculated height.
    // If set textarea height in this case, the scrollbar will not hide.
    // So we need to hide scrollbar first, and reset it in next tick.
    // see https://github.com/element-plus/element-plus/issues/8825
    textareaCalcStyle.value = {
      overflowY: 'hidden',
      ...textareaStyle,
    }

    nextTick(() => {
      // NOTE: Force repaint to make sure the style set above is applied.
      textarea.value!.offsetHeight
      textareaCalcStyle.value = textareaStyle
    })
  } else {
    textareaCalcStyle.value = {
      minHeight: calcTextareaHeight(textarea.value).minHeight,
    }
  }
}

const createOnceInitResize = (resizeTextarea: () => void) => {
  let isInit = false
  return () => {
    if (isInit || !props.autosize) return
    const isElHidden = textarea.value?.offsetParent === null
    if (!isElHidden) {
      resizeTextarea()
      isInit = true
    }
  }
}
// fix: https://github.com/element-plus/element-plus/issues/12074
const onceInitSizeTextarea = createOnceInitResize(resizeTextarea)

const setNativeInputValue = () => {
  const input = _ref.value
  const formatterValue = props.formatter
    ? props.formatter(nativeInputValue.value)
    : nativeInputValue.value
  if (!input || input.value === formatterValue) return
  input.value = formatterValue
}

const handleInput = async (event: Event) => {
  recordCursor()

  let { value } = event.target as TargetElement

  if (props.formatter && props.parser) {
    value = props.parser(value)
  }

  // should not emit input during composition
  // see: https://github.com/ElemeFE/element/issues/10516
  if (isComposing.value) return

  // hack for https://github.com/ElemeFE/element/issues/8548
  // should remove the following line when we don't support IE
  if (value === nativeInputValue.value) {
    setNativeInputValue()
    return
  }

  emit(UPDATE_MODEL_EVENT, value)
  emit('input', value)

  // ensure native input value is controlled
  // see: https://github.com/ElemeFE/element/issues/12850
  await nextTick()
  setNativeInputValue()
  setCursor()
}

const handleChange = (event: Event) => {
  let { value } = event.target as TargetElement

  if (props.formatter && props.parser) {
    value = props.parser(value)
  }
  emit('change', value)
}

const {
  isComposing,
  handleCompositionStart,
  handleCompositionUpdate,
  handleCompositionEnd,
} = useComposition({ emit, afterComposition: handleInput })

const handlePasswordVisible = () => {
  recordCursor()
  passwordVisible.value = !passwordVisible.value
  // The native input needs a little time to regain focus
  setTimeout(setCursor)
}

const focus = () => _ref.value?.focus()

const blur = () => _ref.value?.blur()

const handleMouseLeave = (evt: MouseEvent) => {
  hovering.value = false
  emit('mouseleave', evt)
}

const handleMouseEnter = (evt: MouseEvent) => {
  hovering.value = true
  emit('mouseenter', evt)
}

const handleKeydown = (evt: KeyboardEvent) => {
  emit('keydown', evt)
}

const select = () => {
  _ref.value?.select()
}

const clear = () => {
  emit(UPDATE_MODEL_EVENT, '')
  emit('change', '')
  emit('clear')
  emit('input', '')
}

watch(
  () => props.modelValue,
  () => {
    nextTick(() => resizeTextarea())
    if (props.validateEvent) {
      elFormItem?.validate?.('change').catch((err) => debugWarn(err))
    }
  }
)

// native input value is set explicitly
// do not use v-model / :value in template
// see: https://github.com/ElemeFE/element/issues/14521
watch(nativeInputValue, () => setNativeInputValue())

// when change between <input> and <textarea>,
// update DOM dependent value and styles
// https://github.com/ElemeFE/element/issues/14857
watch(
  () => props.type,
  async () => {
    await nextTick()
    setNativeInputValue()
    resizeTextarea()
  }
)

onMounted(() => {
  if (!props.formatter && props.parser) {
    debugWarn(
      'ElInput',
      'If you set the parser, you also need to set the formatter.'
    )
  }
  setNativeInputValue()
  nextTick(resizeTextarea)
})

defineExpose({
  /** @description HTML input element */
  input,
  /** @description HTML textarea element */
  textarea,
  /** @description HTML element, input or textarea */
  ref: _ref,
  /** @description style of textarea. */
  textareaStyle,

  /** @description from props (used on unit test) */
  autosize: toRef(props, 'autosize'),

  /** @description is input composing */
  isComposing,

  /** @description HTML input element native method */
  focus,
  /** @description HTML input element native method */
  blur,
  /** @description HTML input element native method */
  select,
  /** @description clear input value */
  clear,
  /** @description resize textarea. */
  resizeTextarea,
})
</script>
