<template>
  <div :class="rootKls">
    <button
      :id="scopedHeadId"
      :class="headKls"
      :aria-expanded="isActive"
      :aria-controls="scopedContentId"
      :aria-describedby="scopedContentId"
      :tabindex="disabled ? -1 : 0"
      type="button"
      @click="handleHeaderClick"
      @keydown.space.enter.stop.prevent="handleEnterClick"
      @focus="handleFocus"
      @blur="focusing = false"
    >
      <slot name="icon" :is-active="isActive">
        <el-icon size="10" :class="arrowKls">
          <component :is="IconHide" />
        </el-icon>
      </slot>
      <slot name="title">{{ title }}</slot>
    </button>

    <el-collapse-transition>
      <div
        v-show="isActive"
        :id="scopedContentId"
        role="region"
        :class="itemWrapperKls"
        :aria-hidden="!isActive"
        :aria-labelledby="scopedHeadId"
      >
        <div :class="itemContentKls">
          <slot />
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script lang="ts" setup>
import { h } from 'vue'
import ElCollapseTransition from '@element-plus/components/collapse-transition'
import ElIcon from '@element-plus/components/icon'
import { collapseItemProps } from './collapse-item'
import { useCollapseItem, useCollapseItemDOM } from './use-collapse-item'

defineOptions({
  name: 'ElCollapseItem',
})

const props = defineProps(collapseItemProps)
const {
  focusing,
  id,
  isActive,
  handleFocus,
  handleHeaderClick,
  handleEnterClick,
} = useCollapseItem(props)

const {
  arrowKls,
  headKls,
  rootKls,
  itemWrapperKls,
  itemContentKls,
  scopedContentId,
  scopedHeadId,
} = useCollapseItemDOM(props, { focusing, isActive, id })
const IconHide = h(
  'svg',
  {
    width: '10',
    height: '10',
    viewBox: '0 0 10 10',
    xmlns: 'http://www.w3.org/2000/svg',
  },
  [
    h('path', {
      d: 'M7.79266 5.24033L3.24995 8.88408C3.1262 8.98346 2.92537 8.98346 2.80142 8.88408C2.74183 8.83638 2.7085 8.77158 2.7085 8.7043V1.29615C2.70828 1.15595 2.85037 1.04199 3.02558 1.04199C3.10975 1.04199 3.19016 1.06887 3.24975 1.11657L7.79266 4.76032C7.95787 4.89282 7.95787 5.10782 7.79266 5.24032V5.24033Z',
    }),
  ]
)
defineExpose({
  /** @description current collapse-item whether active */
  isActive,
  handleHeaderClick,
})
</script>
