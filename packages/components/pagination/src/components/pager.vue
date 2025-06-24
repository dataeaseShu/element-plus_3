<template>
  <ul :class="nsPager.b()" @click="onPagerClick" @keyup.enter="onEnter">
    <li
      v-if="pageCount > 0"
      :class="[
        nsPager.is('active', currentPage === 1),
        nsPager.is('disabled', disabled),
      ]"
      class="number"
      :aria-current="currentPage === 1"
      :aria-label="t('el.pagination.currentPage', { pager: 1 })"
      :tabindex="tabindex"
    >
      1
    </li>
    <li
      v-if="showPrevMore"
      :class="prevMoreKls"
      :tabindex="tabindex"
      :aria-label="t('el.pagination.prevPages', { pager: pagerCount - 2 })"
      @mouseenter="onMouseEnter(true)"
      @mouseleave="quickPrevHover = false"
      @focus="onFocus(true)"
      @blur="quickPrevFocus = false"
    >
      <d-arrow-left v-if="(quickPrevHover || quickPrevFocus) && !disabled" />
      <more-filled v-else />
    </li>
    <li
      v-for="pager in pagers"
      :key="pager"
      :class="[
        nsPager.is('active', currentPage === pager),
        nsPager.is('disabled', disabled),
      ]"
      class="number"
      :aria-current="currentPage === pager"
      :aria-label="t('el.pagination.currentPage', { pager })"
      :tabindex="tabindex"
    >
      {{ pager }}
    </li>
    <li
      v-if="showNextMore"
      :class="nextMoreKls"
      :tabindex="tabindex"
      :aria-label="t('el.pagination.nextPages', { pager: pagerCount - 2 })"
      @mouseenter="onMouseEnter()"
      @mouseleave="quickNextHover = false"
      @focus="onFocus()"
      @blur="quickNextFocus = false"
    >
      <d-arrow-right v-if="(quickNextHover || quickNextFocus) && !disabled" />
      <more-filled v-else />
    </li>
    <li
      v-if="pageCount > 1"
      :class="[
        nsPager.is('active', currentPage === pageCount),
        nsPager.is('disabled', disabled),
      ]"
      class="number"
      :aria-current="currentPage === pageCount"
      :aria-label="t('el.pagination.currentPage', { pager: pageCount })"
      :tabindex="tabindex"
    >
      {{ pageCount }}
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { computed, ref, watchEffect, h } from 'vue'
import { DArrowLeft } from '@element-plus/icons-vue'
import { useLocale, useNamespace } from '@element-plus/hooks'
import { paginationPagerProps } from './pager'
defineOptions({
  name: 'ElPaginationPager',
})
const props = defineProps(paginationPagerProps)
const emit = defineEmits(['change'])
const nsPager = useNamespace('pager')
const nsIcon = useNamespace('icon')
const { t } = useLocale()

const showPrevMore = ref(false)
const showNextMore = ref(false)
const quickPrevHover = ref(false)
const quickNextHover = ref(false)
const quickPrevFocus = ref(false)
const quickNextFocus = ref(false)
const pagers = computed(() => {
  const pagerCount = props.pagerCount
  const halfPagerCount = (pagerCount - 1) / 2
  const currentPage = Number(props.currentPage)
  const pageCount = Number(props.pageCount)
  let showPrevMore = false
  let showNextMore = false
  if (pageCount > pagerCount) {
    if (currentPage > pagerCount - halfPagerCount) {
      showPrevMore = true
    }
    if (currentPage < pageCount - halfPagerCount) {
      showNextMore = true
    }
  }
  const array: number[] = []
  if (showPrevMore && !showNextMore) {
    const startPage = pageCount - (pagerCount - 2)
    for (let i = startPage; i < pageCount; i++) {
      array.push(i)
    }
  } else if (!showPrevMore && showNextMore) {
    for (let i = 2; i < pagerCount; i++) {
      array.push(i)
    }
  } else if (showPrevMore && showNextMore) {
    const offset = Math.floor(pagerCount / 2) - 1
    for (let i = currentPage - offset; i <= currentPage + offset; i++) {
      array.push(i)
    }
  } else {
    for (let i = 2; i < pageCount; i++) {
      array.push(i)
    }
  }
  return array
})

const DArrowRight = h(
  'svg',
  {
    width: '16',
    height: '16',
    viewBox: '0 0 16 16',
    xmlns: 'http://www.w3.org/2000/svg',
  },
  [
    h('path', {
      fill: '#245BDB',
      d: 'M7.83135 3.24552L12.5858 8L7.83135 12.7545C7.70118 12.8847 7.70118 13.0957 7.83135 13.2259L8.30276 13.6973C8.43293 13.8275 8.64399 13.8275 8.77416 13.6973L14.0001 8.47141C14.2604 8.21106 14.2604 7.78895 14.0001 7.5286L8.77416 2.30271C8.64399 2.17253 8.43293 2.17253 8.30276 2.30271L7.83135 2.77411C7.70118 2.90429 7.70118 3.11534 7.83135 3.24552Z',
    }),
    h('path', {
      fill: '#245BDB',
      d: 'M1.89792 3.24552L6.65241 8L1.89792 12.7545C1.76775 12.8847 1.76775 13.0957 1.89792 13.2259L2.36933 13.6973C2.4995 13.8275 2.71056 13.8275 2.84073 13.6973L8.06662 8.47141C8.32697 8.21106 8.32697 7.78895 8.06662 7.5286L2.84073 2.30271C2.71055 2.17253 2.4995 2.17253 2.36932 2.30271L1.89792 2.77411C1.76775 2.90429 1.76775 3.11534 1.89792 3.24552Z',
    }),
  ]
)
const MoreFilled = h(
  'svg',
  {
    width: '16',
    height: '16',
    viewBox: '0 0 16 16',
    xmlns: 'http://www.w3.org/2000/svg',
  },
  [
    h('path', {
      fill: '#646A73',
      d: 'M2.33398 7.33333C2.33398 7.14924 2.48322 7 2.66732 7H4.00065C4.18475 7 4.33398 7.14924 4.33398 7.33333V8.66667C4.33398 8.85076 4.18475 9 4.00065 9H2.66732C2.48322 9 2.33398 8.85076 2.33398 8.66667V7.33333Z',
    }),
    h('path', {
      fill: '#646A73',
      d: 'M11.6673 7.33333C11.6673 7.14924 11.8166 7 12.0007 7H13.334C13.5181 7 13.6673 7.14924 13.6673 7.33333V8.66667C13.6673 8.85076 13.5181 9 13.334 9H12.0007C11.8166 9 11.6673 8.85076 11.6673 8.66667V7.33333Z',
    }),
    h('path', {
      fill: '#646A73',
      d: 'M7.33398 7C7.14989 7 7.00065 7.14924 7.00065 7.33333V8.66667C7.00065 8.85076 7.14989 9 7.33398 9H8.66732C8.85141 9 9.00065 8.85076 9.00065 8.66667V7.33333C9.00065 7.14924 8.85141 7 8.66732 7H7.33398Z',
    }),
  ]
)

const prevMoreKls = computed(() => [
  'more',
  'btn-quickprev',
  nsIcon.b(),
  nsPager.is('disabled', props.disabled),
])
const nextMoreKls = computed(() => [
  'more',
  'btn-quicknext',
  nsIcon.b(),
  nsPager.is('disabled', props.disabled),
])

const tabindex = computed(() => (props.disabled ? -1 : 0))
watchEffect(() => {
  const halfPagerCount = (props.pagerCount - 1) / 2
  showPrevMore.value = false
  showNextMore.value = false
  if (props.pageCount! > props.pagerCount) {
    if (props.currentPage > props.pagerCount - halfPagerCount) {
      showPrevMore.value = true
    }
    if (props.currentPage < props.pageCount! - halfPagerCount) {
      showNextMore.value = true
    }
  }
})
function onMouseEnter(forward = false) {
  if (props.disabled) return
  if (forward) {
    quickPrevHover.value = true
  } else {
    quickNextHover.value = true
  }
}
function onFocus(forward = false) {
  if (forward) {
    quickPrevFocus.value = true
  } else {
    quickNextFocus.value = true
  }
}
function onEnter(e: UIEvent) {
  const target = e.target as HTMLElement
  if (
    target.tagName.toLowerCase() === 'li' &&
    Array.from(target.classList).includes('number')
  ) {
    const newPage = Number(target.textContent)
    if (newPage !== props.currentPage) {
      emit('change', newPage)
    }
  } else if (
    target.tagName.toLowerCase() === 'li' &&
    Array.from(target.classList).includes('more')
  ) {
    onPagerClick(e)
  }
}
function onPagerClick(event: UIEvent) {
  const target = event.target as HTMLElement
  if (target.tagName.toLowerCase() === 'ul' || props.disabled) {
    return
  }
  let newPage = Number(target.textContent)
  const pageCount = props.pageCount!
  const currentPage = props.currentPage
  const pagerCountOffset = props.pagerCount - 2
  if (target.className.includes('more')) {
    if (target.className.includes('quickprev')) {
      newPage = currentPage - pagerCountOffset
    } else if (target.className.includes('quicknext')) {
      newPage = currentPage + pagerCountOffset
    }
  }
  if (!Number.isNaN(+newPage)) {
    if (newPage < 1) {
      newPage = 1
    }
    if (newPage > pageCount) {
      newPage = pageCount
    }
  }
  if (newPage !== currentPage) {
    emit('change', newPage)
  }
}
</script>
