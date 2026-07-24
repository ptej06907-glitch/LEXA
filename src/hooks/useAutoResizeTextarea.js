import { useCallback, useLayoutEffect, useRef } from 'react'

const MAX_HEIGHT = 320

export default function useAutoResizeTextarea(value, maxHeight = MAX_HEIGHT) {
  const textareaRef = useRef(null)

  const resize = useCallback((element = textareaRef.current) => {
    if (!element) return

    element.style.height = 'auto'
    const nextHeight = Math.min(element.scrollHeight, maxHeight)
    element.style.height = `${nextHeight}px`
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [maxHeight])

  useLayoutEffect(() => {
    resize()
  }, [resize, value])

  return { textareaRef, resize }
}
