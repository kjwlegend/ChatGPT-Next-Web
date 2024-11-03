'use client'

import { memo } from 'react'
import styles from './styles.module.scss'

interface DragHandleProps {
  onDragStart: (event: React.DragEvent) => void
}

export const DragHandle = memo(({ onDragStart }: DragHandleProps) => {
  return (
    <div
      className={styles.dragHandle}
      draggable
      onDragStart={onDragStart}
    >
      <span className={styles.icon}>+</span>
    </div>
  )
})

DragHandle.displayName = 'DragHandle' 