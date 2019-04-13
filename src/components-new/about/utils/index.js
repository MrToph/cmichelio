import { useState } from 'react'

export function useSections(initialSections) {
  const [sections, setState] = useState(initialSections)

  const showSection = section => () => {
    const newSections = sections.slice()

    const sectionIndex = newSections.findIndex(s => s === section)
    if (sectionIndex >= 0) newSections.splice(sectionIndex, 1)
    newSections.unshift(section)

    return setState(newSections)
  }

  return [sections, showSection]
}
