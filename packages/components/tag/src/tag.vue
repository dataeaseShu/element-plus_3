<template>
  <span
    v-if="disableTransitions"
    :class="containerKls"
    :style="{ backgroundColor: color }"
    @click="handleClick"
  >
    <span
      :class="ns.e('content')"
      :style="formatterStyle(customStyle, ['text'])"
    >
      <slot />
    </span>
    <el-icon v-if="closable" :class="ns.e('close')" @click.stop="handleClose">
      <Close />
    </el-icon>
  </span>
  <transition
    v-else
    :name="`${ns.namespace.value}-zoom-in-center`"
    appear
    @vue:mounted="handleVNodeMounted"
  >
    <span
      :class="containerKls"
      :style="{ backgroundColor: color }"
      @click="handleClick"
    >
      <span :class="ns.e('content')">
        <slot />
      </span>
      <el-icon v-if="closable" :class="ns.e('close')" @click.stop="handleClose">
        <Close />
      </el-icon>
    </span>
  </transition>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import ElIcon from '@element-plus/components/icon'
import { Close } from '@element-plus/icons-vue'
import { useNamespace } from '@element-plus/hooks'
import { useFormSize } from '@element-plus/components/form'

import { tagEmits, tagProps } from './tag'
import { formatterStyle, type CustomStyle } from '@element-plus/utils'
import type { VNode } from 'vue'

defineOptions({
  name: 'ElTag',
})
const props = defineProps(tagProps)
const emit = defineEmits(tagEmits)

const tagSize = useFormSize()
const ns = useNamespace('tag')
const customStyle = inject('$custom-style-filter', {}) as CustomStyle
const containerKls = computed(() => {
  const { type, hit, effect, closable, round } = props
  return [
    ns.b(),
    ns.is('closable', closable),
    ns.m(type || 'primary'),
    ns.m(tagSize.value),
    ns.m(effect),
    ns.is('hit', hit),
    ns.is('round', round),
  ]
})

// methods
const handleClose = (event: MouseEvent) => {
  emit('close', event)
}

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}

const handleVNodeMounted = (vnode: VNode) => {
  // @ts-ignore
  if (vnode?.component?.subTree?.component?.bum) {
    // @ts-ignore
    vnode.component.subTree.component.bum = null
  }
}
</script>
