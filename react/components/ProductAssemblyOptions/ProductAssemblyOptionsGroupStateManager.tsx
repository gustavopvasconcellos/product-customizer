import React, { useReducer, useEffect, FC } from 'react'
import { propEq, mapObjIndexed, pick, path } from 'ramda'
import { useProductDispatch } from 'vtex.product-context/ProductDispatchContext'
import ProductAssemblyOptionsGroup from './ProductAssemblyOptionsGroup'
import {
  ProductAssemblyDispatchContext,
  DispatchAction,
} from '../ProductAssemblyContext'

type State = AssemblyOptionGroup

interface BuyButtonItem {
  name: string
  id: string
  initialQuantity: number
  quantity: number
  seller: string
  price: number
  choiceType: string
  children: Record<string, BuyButtonItem[]> | null
}

const maxIsOne = propEq('maxQuantity', 1)

const getGroupType = (assemblyOption: AssemblyOptionGroup) => {
  if (assemblyOption.maxQuantity === 1) {
    return 'SINGLE'
  }

  if (Object.values(assemblyOption.items).every(maxIsOne)) {
    return 'TOGGLE'
  }

  return 'MULTIPLE'
}

const removeAllItems = mapObjIndexed<AssemblyItem, AssemblyItem>(item => ({
  ...item,
  quantity: 0,
}))

function reducer(state: State, action: DispatchAction) {
  const args = action.args || {}
  switch (action.type) {
    case 'SET_QUANTITY':
      const { itemId, newQuantity, type, groupPath } = args
      const groupState = path(groupPath, state) as AssemblyOptionGroup
      let newItems = groupState.items
      if (type === 'SINGLE') {
        newItems = removeAllItems(newItems)
      }
      groupState.items = {
        ...newItems,
        [itemId]: {
          ...newItems[itemId],
          quantity: newQuantity,
        },
      }
      return { ...state }
    default:
      return state
  }
}

const parseItemChildren = (children: Record<string, AssemblyOptionGroup>) => {
  const groupIds = Object.keys(children)
  const result = {} as Record<string, BuyButtonItem[]>
  for (const groupId of groupIds) {
    const childrenAssemblyOption = children[groupId]
    const groupType = getGroupType(childrenAssemblyOption)
    result[groupId] = Object.values(childrenAssemblyOption.items).map(
      parseItem(groupType)
    )
  }
  return result
}

const parseItem = (groupType: string) => (item: AssemblyItem) => ({
  ...pick(['name', 'id', 'initialQuantity', 'quantity', 'seller'], item),
  price: item.price / 100,
  choiceType: groupType,
  children: item.children ? parseItemChildren(item.children) : null,
})

const isGroupValid = (group: AssemblyOptionGroup) => {
  const items = Object.values(group.items)
  const groupSum = items.reduce((acc, { quantity }) => acc + quantity, 0)
  const itemsToBeAdded = groupSum
  const isValid =
    group.maxQuantity >= itemsToBeAdded && group.minQuantity <= itemsToBeAdded

  if (!isValid) {
    // No need to check children if group is already invalid
    return false
  }

  const areItemsValid = items.every(item => {
    if (!item.children) {
      return true
    }
    const childrenGroups = Object.values(item.children)
    const areChildrenValids = childrenGroups.every(childGroup =>
      isGroupValid(childGroup)
    )
    return areChildrenValids
  })
  return areItemsValid
}

function useAssemblyOptionsModifications(localState: State, groupType: string) {
  const dispatch = useProductDispatch()

  useEffect(() => {
    const { items: localItems, id } = localState
    const items = Object.values(localItems).map(parseItem(groupType))
    const isValid = isGroupValid(localState)
    console.log('teste setting isValid: ', isValid)
    console.log('teste setting localState: ', localState)
    dispatch({
      type: 'SET_ASSEMBLY_OPTIONS',
      args: {
        groupId: id,
        groupItems: items,
        isValid,
      },
    })
  }, [localState, groupType, dispatch])
}

interface Props {
  assemblyOption: AssemblyOptionGroup
}

const ProductAssemblyOptionsGroupStateManager: FC<Props> = ({
  assemblyOption,
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, assemblyOption)
  const groupType = getGroupType(assemblyOption)
  useAssemblyOptionsModifications(state, groupType)
  return (
    <ProductAssemblyDispatchContext.Provider value={dispatch}>
      <ProductAssemblyOptionsGroup assemblyOptionState={state}>
        {children}
      </ProductAssemblyOptionsGroup>
    </ProductAssemblyDispatchContext.Provider>
  )
}

export default ProductAssemblyOptionsGroupStateManager
