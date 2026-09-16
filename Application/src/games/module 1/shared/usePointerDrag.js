import { useEffect, useRef, useState } from 'react'

export function usePointerDrag(onDrop) {
  const [drag, setDrag] = useState(null)
  const dragRef = useRef(null)
  const onDropRef = useRef(onDrop)
  onDropRef.current = onDrop

  function start(event, payload) {
    if (event.button !== undefined && event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const next = {
      ...payload,
      x: event.clientX,
      y: event.clientY,
    }
    dragRef.current = next
    setDrag(next)
  }

  useEffect(() => {
    function move(event) {
      if (!dragRef.current) return
      const next = { ...dragRef.current, x: event.clientX, y: event.clientY }
      dragRef.current = next
      setDrag(next)
    }

    function up(event) {
      if (!dragRef.current) return
      const dropped = dragRef.current
      dragRef.current = null
      setDrag(null)
      const hit = document.elementFromPoint(event.clientX, event.clientY)
      const zone = hit?.closest?.('[data-drop-id]')
      onDropRef.current?.({
        payload: dropped,
        zoneId: zone?.getAttribute('data-drop-id') ?? null,
      })
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return { drag, start }
}
