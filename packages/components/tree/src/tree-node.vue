<template>
  <div
    v-show="node.visible"
    ref="node$"
    :class="[
      ns.b('node'),
      ns.is('expanded', expanded),
      ns.is('current', node.isCurrent),
      ns.is('hidden', !node.visible),
      ns.is('focusable', !node.disabled),
      ns.is('checked', !node.disabled && node.checked),
      getNodeClass(node),
    ]"
    role="treeitem"
    tabindex="-1"
    :aria-expanded="expanded"
    :aria-disabled="node.disabled"
    :aria-checked="node.checked"
    :draggable="tree.props.draggable"
    :data-key="getNodeKey(node)"
    @click.stop="handleClick"
    @contextmenu="handleContextMenu"
    @dragstart.stop="handleDragStart"
    @dragover.stop="handleDragOver"
    @dragend.stop="handleDragEnd"
    @drop.stop="handleDrop"
  >
    <div
      :class="ns.be('node', 'content')"
      :style="{ paddingLeft: (node.level - 1) * tree.props.indent + 'px' }"
    >
      <el-icon
        v-if="tree.props.icon || CaretRight"
        :class="[
          ns.be('node', 'expand-icon'),
          ns.is('leaf', node.isLeaf),
          {
            expanded: !node.isLeaf && expanded,
          },
        ]"
        @click.stop="handleExpandIconClick"
      >
        <component :is="tree.props.icon || CaretRight" />
      </el-icon>
      <el-checkbox
        v-if="showCheckbox"
        :model-value="node.checked"
        :indeterminate="node.indeterminate"
        :disabled="!!node.disabled"
        @click.stop
        @change="handleCheckChange"
      />
      <el-icon
        v-if="node.loading"
        :class="[ns.be('node', 'loading-icon'), ns.is('loading')]"
      >
        <loading />
      </el-icon>
      <node-content :node="node" :render-content="renderContent" />
    </div>
    <el-collapse-transition>
      <div
        v-if="!renderAfterExpand || childNodeRendered"
        v-show="expanded"
        :class="ns.be('node', 'children')"
        role="group"
        :aria-expanded="expanded"
      >
        <el-tree-node
          v-for="child in node.childNodes"
          :key="getNodeKey(child)"
          :render-content="renderContent"
          :render-after-expand="renderAfterExpand"
          :show-checkbox="showCheckbox"
          :node="child"
          :accordion="accordion"
          :props="props"
          @node-expand="handleChildNodeExpand"
        />
      </div>
    </el-collapse-transition>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  provide,
  ref,
  watch,
  h,
} from 'vue'
import { debugWarn, isFunction, isString } from '@element-plus/utils'
import ElCollapseTransition from '@element-plus/components/collapse-transition'
import ElCheckbox from '@element-plus/components/checkbox'
import { ElIcon } from '@element-plus/components/icon'
import { Loading } from '@element-plus/icons-vue'
import { useNamespace } from '@element-plus/hooks'
import NodeContent from './tree-node-content.vue'
import { getNodeKey as getNodeKeyUtil, handleCurrentChange } from './model/util'
import { useNodeExpandEventBroadcast } from './model/useNodeExpandEventBroadcast'
import { dragEventsKey } from './model/useDragNode'
import Node from './model/node'

import type { ComponentInternalInstance, PropType } from 'vue'
import type { RootTreeType, TreeNodeData, TreeOptionProps } from './tree.type'
import type { CheckboxValueType } from '@element-plus/components/checkbox'

export default defineComponent({
  name: 'ElTreeNode',
  components: {
    ElCollapseTransition,
    ElCheckbox,
    NodeContent,
    ElIcon,
    Loading,
  },
  props: {
    node: {
      type: Node,
      default: () => ({}),
    },
    props: {
      type: Object as PropType<TreeOptionProps>,
      default: () => ({}),
    },
    accordion: Boolean,
    renderContent: Function,
    renderAfterExpand: Boolean,
    showCheckbox: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['node-expand'],
  setup(props, ctx) {
    const ns = useNamespace('tree')
    const { broadcastExpanded } = useNodeExpandEventBroadcast(props)
    const tree = inject<RootTreeType>('RootTree')!
    const expanded = ref(false)
    const childNodeRendered = ref(false)
    const oldChecked = ref<boolean>()
    const oldIndeterminate = ref<boolean>()
    const node$ = ref<HTMLElement>()
    const dragEvents = inject(dragEventsKey)!
    const instance = getCurrentInstance()

    provide('NodeInstance', instance)
    if (!tree) {
      debugWarn('Tree', "Can not find node's tree.")
    }

    if (props.node.expanded) {
      expanded.value = true
      childNodeRendered.value = true
    }

    const childrenKey = tree.props.props['children'] || 'children'
    watch(
      () => {
        const children = props.node.data?.[childrenKey]
        return children && [...children]
      },
      () => {
        props.node.updateChildren()
      }
    )

    watch(
      () => props.node.indeterminate,
      (val) => {
        handleSelectChange(props.node.checked, val)
      }
    )

    watch(
      () => props.node.checked,
      (val) => {
        handleSelectChange(val, props.node.indeterminate)
      }
    )

    watch(
      () => props.node.childNodes.length,
      () => props.node.reInitChecked()
    )

    watch(
      () => props.node.expanded,
      (val) => {
        nextTick(() => (expanded.value = val))
        if (val) {
          childNodeRendered.value = true
        }
      }
    )

    const getNodeKey = (node: Node): any => {
      return getNodeKeyUtil(tree.props.nodeKey, node.data)
    }

    const getNodeClass = (node: Node) => {
      const nodeClassFunc = props.props.class
      if (!nodeClassFunc) {
        return {}
      }
      let className
      if (isFunction(nodeClassFunc)) {
        const { data } = node
        className = nodeClassFunc(data, node)
      } else {
        className = nodeClassFunc
      }

      if (isString(className)) {
        return { [className]: true }
      } else {
        return className
      }
    }

    const CaretRight = h(
      'svg',
      {
        width: '10',
        height: '10',
        viewBox: '0 0 10 10',
        xmlns: 'http://www.w3.org/2000/svg',
      },
      [
        h('path', {
          d: 'M7.79266 5.23984L3.24995 8.88359C3.1262 8.98297 2.92537 8.98297 2.80142 8.88359C2.74183 8.83589 2.7085 8.77109 2.7085 8.70381V1.29566C2.70828 1.15546 2.85037 1.0415 3.02558 1.0415C3.10975 1.0415 3.19016 1.06838 3.24975 1.11608L7.79266 4.75983C7.95787 4.89233 7.95787 5.10733 7.79266 5.23983V5.23984Z',
        }),
      ]
    )

    const handleSelectChange = (checked: boolean, indeterminate: boolean) => {
      if (
        oldChecked.value !== checked ||
        oldIndeterminate.value !== indeterminate
      ) {
        tree.ctx.emit('check-change', props.node.data, checked, indeterminate)
      }
      oldChecked.value = checked
      oldIndeterminate.value = indeterminate
    }

    const handleClick = (e: MouseEvent) => {
      handleCurrentChange(tree.store, tree.ctx.emit, () => {
        const nodeKeyProp = tree?.props?.nodeKey
        if (nodeKeyProp) {
          const curNodeKey = getNodeKey(props.node)
          tree.store.value.setCurrentNodeKey(curNodeKey)
        } else {
          tree.store.value.setCurrentNode(props.node)
        }
      })
      tree.currentNode.value = props.node

      if (tree.props.expandOnClickNode) {
        handleExpandIconClick()
      }

      if (
        (tree.props.checkOnClickNode ||
          (props.node.isLeaf && tree.props.checkOnClickLeaf)) &&
        !props.node.disabled
      ) {
        handleCheckChange(!props.node.checked)
      }
      tree.ctx.emit('node-click', props.node.data, props.node, instance, e)
    }

    const handleContextMenu = (event: Event) => {
      if (tree.instance.vnode.props?.['onNodeContextmenu']) {
        event.stopPropagation()
        event.preventDefault()
      }
      tree.ctx.emit(
        'node-contextmenu',
        event,
        props.node.data,
        props.node,
        instance
      )
    }

    const handleExpandIconClick = () => {
      if (props.node.isLeaf) return
      if (expanded.value) {
        tree.ctx.emit('node-collapse', props.node.data, props.node, instance)
        props.node.collapse()
      } else {
        props.node.expand(() => {
          ctx.emit('node-expand', props.node.data, props.node, instance)
        })
      }
    }

    const handleCheckChange = (value: CheckboxValueType) => {
      props.node.setChecked(value as boolean, !tree?.props.checkStrictly)
      nextTick(() => {
        const store = tree.store.value
        tree.ctx.emit('check', props.node.data, {
          checkedNodes: store.getCheckedNodes(),
          checkedKeys: store.getCheckedKeys(),
          halfCheckedNodes: store.getHalfCheckedNodes(),
          halfCheckedKeys: store.getHalfCheckedKeys(),
        })
      })
    }

    const handleChildNodeExpand = (
      nodeData: TreeNodeData,
      node: Node,
      instance: ComponentInternalInstance
    ) => {
      broadcastExpanded(node)
      tree.ctx.emit('node-expand', nodeData, node, instance)
    }

    const handleDragStart = (event: DragEvent) => {
      if (!tree.props.draggable) return
      dragEvents.treeNodeDragStart({ event, treeNode: props })
    }

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault()
      if (!tree.props.draggable) return
      dragEvents.treeNodeDragOver({
        event,
        treeNode: { $el: node$.value, node: props.node },
      })
    }

    const handleDrop = (event: DragEvent) => {
      event.preventDefault()
    }

    const handleDragEnd = (event: DragEvent) => {
      if (!tree.props.draggable) return
      dragEvents.treeNodeDragEnd(event)
    }

    return {
      ns,
      node$,
      tree,
      expanded,
      childNodeRendered,
      oldChecked,
      oldIndeterminate,
      getNodeKey,
      getNodeClass,
      handleSelectChange,
      handleClick,
      handleContextMenu,
      handleExpandIconClick,
      handleCheckChange,
      handleChildNodeExpand,
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleDragEnd,
      CaretRight,
    }
  },
})
</script>
