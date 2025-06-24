import {
  Fragment,
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  vShow,
  watch,
  withDirectives,
} from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import ElCollapseTransition from '@element-plus/components/collapse-transition'
import ElTooltip from '@element-plus/components/tooltip'
import {
  buildProps,
  iconPropType,
  isString,
  throwError,
} from '@element-plus/utils'
import { useNamespace } from '@element-plus/hooks'
import { ArrowRight } from '@element-plus/icons-vue'
import { ElIcon } from '@element-plus/components/icon'
import useMenu from './use-menu'
import { useMenuCssVar } from './use-menu-css-var'

import type { Placement } from '@element-plus/components/popper'
import type { TooltipInstance } from '@element-plus/components/tooltip'
import type { ExtractPropTypes, VNodeArrayChildren } from 'vue'
import type { MenuProvider, SubMenuProvider } from './types'

export const subMenuProps = buildProps({
  /**
   * @description unique identification
   */
  index: {
    type: String,
    required: true,
  },
  /**
   * @description timeout before showing a sub-menu(inherit `show-timeout` of the menu by default.)
   */
  showTimeout: Number,
  /**
   * @description timeout before hiding a sub-menu(inherit `hide-timeout` of the menu by default.)
   */
  hideTimeout: Number,
  /**
   * @description custom class name for the popup menu
   */
  popperClass: String,
  /**
   * @description whether the sub-menu is disabled
   */
  disabled: Boolean,
  /**
   * @description whether popup menu is teleported to the body
   */
  teleported: {
    type: Boolean,
    default: undefined,
  },
  /**
   * @description offset of the popper (overrides the `popper` of menu)
   */
  popperOffset: Number,
  /**
   * @description Icon when menu are expanded and submenu are closed, `expand-close-icon` and `expand-open-icon` need to be passed together to take effect
   */
  expandCloseIcon: {
    type: iconPropType,
  },
  /**
   * @description Icon when menu are expanded and submenu are opened, `expand-open-icon` and `expand-close-icon` need to be passed together to take effect
   */
  expandOpenIcon: {
    type: iconPropType,
  },
  /**
   * @description Icon when menu are collapsed and submenu are closed, `collapse-close-icon` and `collapse-open-icon` need to be passed together to take effect
   */
  collapseCloseIcon: {
    type: iconPropType,
  },
  /**
   * @description Icon when menu are collapsed and submenu are opened, `collapse-open-icon` and `collapse-close-icon` need to be passed together to take effect
   */
  collapseOpenIcon: {
    type: iconPropType,
  },
} as const)
export type SubMenuProps = ExtractPropTypes<typeof subMenuProps>

const COMPONENT_NAME = 'ElSubMenu'
export default defineComponent({
  name: COMPONENT_NAME,
  props: subMenuProps,

  setup(props, { slots, expose }) {
    const instance = getCurrentInstance()!
    const { indexPath, parentMenu } = useMenu(
      instance,
      computed(() => props.index)
    )
    const nsMenu = useNamespace('menu')
    const nsSubMenu = useNamespace('sub-menu')

    // inject
    const rootMenu = inject<MenuProvider>('rootMenu')
    if (!rootMenu) throwError(COMPONENT_NAME, 'can not inject root menu')

    const subMenu = inject<SubMenuProvider>(`subMenu:${parentMenu.value!.uid}`)
    if (!subMenu) throwError(COMPONENT_NAME, 'can not inject sub menu')

    const items = ref<MenuProvider['items']>({})
    const subMenus = ref<MenuProvider['subMenus']>({})

    let timeout: (() => void) | undefined
    const mouseInChild = ref(false)
    const verticalTitleRef = ref<HTMLDivElement>()
    const vPopper = ref<TooltipInstance>()

    // computed
    const currentPlacement = computed<Placement>(() =>
      mode.value === 'horizontal' && isFirstLevel.value
        ? 'bottom-start'
        : 'right-start'
    )

    const ArrowDownFill = h(
      'svg',
      {
        width: '12',
        height: '12',
        viewBox: '0 0 12 12',
        xmlns: 'http://www.w3.org/2000/svg',
      },
      [
        h('path', {
          d: 'M5.712 9.35123L1.3395 3.89999C1.22025 3.75149 1.22025 3.51049 1.3395 3.36175C1.39674 3.29024 1.4745 3.25024 1.55524 3.25024H10.445C10.6135 3.25024 10.7502 3.42074 10.7502 3.63099C10.7502 3.73199 10.718 3.82849 10.6607 3.89999L6.28824 9.35149C6.12924 9.54974 5.87124 9.54974 5.71224 9.35149L5.712 9.35123Z',
        }),
      ]
    )

    const ArrowDown = h(
      'svg',
      {
        width: '16',
        height: '16',
        viewBox: '0 0 16 16',
        xmlns: 'http://www.w3.org/2000/svg',
      },
      [
        h('path', {
          fill: '#8F959E',
          d: 'M8.00066 10.5759L13.4218 5.15476C13.552 5.02459 13.763 5.02459 13.8932 5.15476L14.3646 5.62616C14.4948 5.75634 14.4948 5.96739 14.3646 6.09757L8.47206 11.9901C8.21171 12.2505 7.7896 12.2505 7.52925 11.9901L1.63669 6.09757C1.50652 5.96739 1.50652 5.75634 1.63669 5.62616L2.1081 5.15476C2.23827 5.02459 2.44933 5.02459 2.5795 5.15476L8.00066 10.5759Z',
        }),
      ]
    )
    const subMenuTitleIcon = computed(() => {
      return (mode.value === 'horizontal' && isFirstLevel.value) ||
        (mode.value === 'vertical' && !rootMenu.props.collapse)
        ? props.expandCloseIcon && props.expandOpenIcon
          ? opened.value
            ? props.expandOpenIcon
            : props.expandCloseIcon
          : mode.value === 'horizontal'
          ? ArrowDownFill
          : ArrowDown
        : props.collapseCloseIcon && props.collapseOpenIcon
        ? opened.value
          ? props.collapseOpenIcon
          : props.collapseCloseIcon
        : ArrowRight
    })
    const isFirstLevel = computed(() => subMenu.level === 0)
    const appendToBody = computed(() => {
      const value = props.teleported
      return value === undefined ? isFirstLevel.value : value
    })
    const menuTransitionName = computed(() =>
      rootMenu.props.collapse
        ? `${nsMenu.namespace.value}-zoom-in-left`
        : `${nsMenu.namespace.value}-zoom-in-top`
    )
    const fallbackPlacements = computed<Placement[]>(() =>
      mode.value === 'horizontal' && isFirstLevel.value
        ? [
            'bottom-start',
            'bottom-end',
            'top-start',
            'top-end',
            'right-start',
            'left-start',
          ]
        : [
            'right-start',
            'right',
            'right-end',
            'left-start',
            'bottom-start',
            'bottom-end',
            'top-start',
            'top-end',
          ]
    )
    const opened = computed(() => rootMenu.openedMenus.includes(props.index))
    const active = computed(() =>
      [...Object.values(items.value), ...Object.values(subMenus.value)].some(
        ({ active }) => active
      )
    )

    const mode = computed(() => rootMenu.props.mode)
    const persistent = computed(() => rootMenu.props.persistent)
    const item = reactive({
      index: props.index,
      indexPath,
      active,
    })

    const ulStyle = useMenuCssVar(rootMenu.props, subMenu.level + 1)

    const subMenuPopperOffset = computed(
      () => props.popperOffset ?? rootMenu.props.popperOffset
    )

    const subMenuPopperClass = computed(
      () => props.popperClass ?? rootMenu.props.popperClass
    )

    const subMenuShowTimeout = computed(
      () => props.showTimeout ?? rootMenu.props.showTimeout
    )

    const subMenuHideTimeout = computed(
      () => props.hideTimeout ?? rootMenu.props.hideTimeout
    )

    // methods
    const doDestroy = () =>
      vPopper.value?.popperRef?.popperInstanceRef?.destroy()

    const handleCollapseToggle = (value: boolean) => {
      if (!value) {
        doDestroy()
      }
    }

    const handleClick = () => {
      if (
        (rootMenu.props.menuTrigger === 'hover' &&
          rootMenu.props.mode === 'horizontal') ||
        (rootMenu.props.collapse && rootMenu.props.mode === 'vertical') ||
        props.disabled
      )
        return

      rootMenu.handleSubMenuClick({
        index: props.index,
        indexPath: indexPath.value,
        active: active.value,
      })
    }

    const handleMouseenter = (
      event: MouseEvent | FocusEvent,
      showTimeout = subMenuShowTimeout.value
    ) => {
      if (event.type === 'focus') return

      if (
        (rootMenu.props.menuTrigger === 'click' &&
          rootMenu.props.mode === 'horizontal') ||
        (!rootMenu.props.collapse && rootMenu.props.mode === 'vertical') ||
        props.disabled
      ) {
        subMenu.mouseInChild.value = true
        return
      }
      subMenu.mouseInChild.value = true

      timeout?.()
      ;({ stop: timeout } = useTimeoutFn(() => {
        rootMenu.openMenu(props.index, indexPath.value)
      }, showTimeout))

      if (appendToBody.value) {
        parentMenu.value.vnode.el?.dispatchEvent(new MouseEvent('mouseenter'))
      }
    }

    const handleMouseleave = (deepDispatch = false) => {
      if (
        (rootMenu.props.menuTrigger === 'click' &&
          rootMenu.props.mode === 'horizontal') ||
        (!rootMenu.props.collapse && rootMenu.props.mode === 'vertical')
      ) {
        subMenu.mouseInChild.value = false
        return
      }
      timeout?.()
      subMenu.mouseInChild.value = false
      ;({ stop: timeout } = useTimeoutFn(
        () =>
          !mouseInChild.value &&
          rootMenu.closeMenu(props.index, indexPath.value),
        subMenuHideTimeout.value
      ))

      if (appendToBody.value && deepDispatch) {
        subMenu.handleMouseleave?.(true)
      }
    }

    watch(
      () => rootMenu.props.collapse,
      (value) => handleCollapseToggle(Boolean(value))
    )

    // provide
    {
      const addSubMenu: SubMenuProvider['addSubMenu'] = (item) => {
        subMenus.value[item.index] = item
      }
      const removeSubMenu: SubMenuProvider['removeSubMenu'] = (item) => {
        delete subMenus.value[item.index]
      }
      provide<SubMenuProvider>(`subMenu:${instance.uid}`, {
        addSubMenu,
        removeSubMenu,
        handleMouseleave,
        mouseInChild,
        level: subMenu.level + 1,
      })
    }

    // expose
    expose({
      opened,
    })

    // lifecycle
    onMounted(() => {
      rootMenu.addSubMenu(item)
      subMenu.addSubMenu(item)
    })

    onBeforeUnmount(() => {
      subMenu.removeSubMenu(item)
      rootMenu.removeSubMenu(item)
    })

    return () => {
      const titleTag: VNodeArrayChildren = [
        slots.title?.(),
        h(
          ElIcon,
          {
            class: nsSubMenu.e('icon-arrow'),
            size: mode.value === 'horizontal' ? 12 : 16,
            style: {
              transform: opened.value
                ? (props.expandCloseIcon && props.expandOpenIcon) ||
                  (props.collapseCloseIcon &&
                    props.collapseOpenIcon &&
                    rootMenu.props.collapse)
                  ? 'none'
                  : 'rotateZ(180deg)'
                : 'none',
            },
          },
          {
            default: () =>
              isString(subMenuTitleIcon.value)
                ? h(instance.appContext.components[subMenuTitleIcon.value])
                : h(subMenuTitleIcon.value),
          }
        ),
      ]

      // this render function is only used for bypass `Vue`'s compiler caused patching issue.
      const child = rootMenu.isMenuPopup
        ? h(
            ElTooltip,
            {
              ref: vPopper,
              visible: opened.value,
              effect: 'light',
              pure: true,
              offset: subMenuPopperOffset.value,
              showArrow: false,
              persistent: persistent.value,
              popperClass: subMenuPopperClass.value,
              placement: currentPlacement.value,
              teleported: appendToBody.value,
              fallbackPlacements: fallbackPlacements.value,
              transition: menuTransitionName.value,
              gpuAcceleration: false,
            },
            {
              content: () =>
                h(
                  'div',
                  {
                    class: [
                      nsMenu.m(mode.value),
                      nsMenu.m('popup-container'),
                      subMenuPopperClass.value,
                    ],
                    onMouseenter: (evt: MouseEvent) =>
                      handleMouseenter(evt, 100),
                    onMouseleave: () => handleMouseleave(true),
                    onFocus: (evt: FocusEvent) => handleMouseenter(evt, 100),
                  },
                  [
                    h(
                      'ul',
                      {
                        class: [
                          nsMenu.b(),
                          nsMenu.m('popup'),
                          nsMenu.m(`popup-${currentPlacement.value}`),
                        ],
                        style: ulStyle.value,
                      },
                      [slots.default?.()]
                    ),
                  ]
                ),
              default: () =>
                h(
                  'div',
                  {
                    class: nsSubMenu.e('title'),
                    onClick: handleClick,
                  },
                  titleTag
                ),
            }
          )
        : h(Fragment, {}, [
            h(
              'div',
              {
                class: nsSubMenu.e('title'),
                ref: verticalTitleRef,
                onClick: handleClick,
              },
              titleTag
            ),
            h(
              ElCollapseTransition,
              {},
              {
                default: () =>
                  withDirectives(
                    h(
                      'ul',
                      {
                        role: 'menu',
                        class: [nsMenu.b(), nsMenu.m('inline')],
                        style: ulStyle.value,
                      },
                      [slots.default?.()]
                    ),
                    [[vShow, opened.value]]
                  ),
              }
            ),
          ])

      return h(
        'li',
        {
          class: [
            nsSubMenu.b(),
            nsSubMenu.is('active', active.value),
            nsSubMenu.is('opened', opened.value),
            nsSubMenu.is('disabled', props.disabled),
          ],
          role: 'menuitem',
          ariaHaspopup: true,
          ariaExpanded: opened.value,
          onMouseenter: handleMouseenter,
          onMouseleave: () => handleMouseleave(),
          onFocus: handleMouseenter,
        },
        [child]
      )
    }
  },
})
