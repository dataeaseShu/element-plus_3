import {
  CircleCheck,
  CircleClose,
  CircleCloseFilled,
  Close,
  InfoFilled,
  Loading,
  SuccessFilled,
  WarningFilled,
} from '@element-plus/icons-vue'
import info from '@element-plus/components/aicon/info.vue'
import success from '@element-plus/components/aicon/success.vue'
import error from '@element-plus/components/aicon/error.vue'
import warning from '@element-plus/components/aicon/warning.vue'
import { definePropType } from './props'
import type { Component } from 'vue'

export const iconPropType = definePropType<string | Component>([
  String,
  Object,
  Function,
])

export const CloseComponents = {
  Close,
}

export const TypeComponents = {
  Close,
  SuccessFilled,
  InfoFilled,
  WarningFilled,
  CircleCloseFilled,
}

export const TypeComponentsMap = {
  success,
  warning,
  error,
  info,
}

export const ValidateComponentsMap = {
  validating: Loading,
  success: CircleCheck,
  error: CircleClose,
}
