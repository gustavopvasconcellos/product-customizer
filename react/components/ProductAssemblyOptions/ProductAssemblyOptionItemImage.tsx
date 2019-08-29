import React, { FC } from 'react'
import { head } from 'ramda'
import { useProductAssemblyItem } from '../ProductAssemblyContext'

const IMAGE_SIZE = 54

export const imageUrlForSize = (imageUrl: string, size: number) => {
  if (!imageUrl) {
    return ''
  }
  const urlSplitted = imageUrl.split('/')
  const idsStringIdx = urlSplitted.findIndex(content => content === 'ids')
  if (idsStringIdx < 0 || idsStringIdx === urlSplitted.length - 1) {
    return imageUrl
  }

  const sizeStringIdx = idsStringIdx + 1
  const sizeString = urlSplitted[sizeStringIdx]
  const imageId = head(sizeString.split('-'))
  const multiplier = (window && window.devicePixelRatio) || 1
  const newSizeString = `${imageId}-${size * multiplier}-auto`
  return [
    ...urlSplitted.slice(0, sizeStringIdx),
    newSizeString,
    ...urlSplitted.slice(sizeStringIdx + 1),
  ].join('/')
}

const Image: FC = () => {
  const { item } = useProductAssemblyItem()
  return (
    <img
      src={imageUrlForSize(item.image, IMAGE_SIZE)}
      width={IMAGE_SIZE}
      height={IMAGE_SIZE}
    />
  )
}

export default Image