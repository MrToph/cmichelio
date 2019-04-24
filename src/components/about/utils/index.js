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

export const formatDate = date => {
  const s = date.toDateString().split(` `)
  s.shift()
  return s.join(` `)
}

export const calculatePostsPerWeek = (numPosts, fromDate) => {
  const weeksPassed =
    (Date.now() - fromDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  return (numPosts / weeksPassed).toFixed(2)
}

export const decodeMail = encodedMail => {
  let decoded = ``
  for (let i = 0; i < encodedMail.length; i++) {
    decoded += String.fromCharCode(encodedMail.charCodeAt(i) ^ 33)
  }
  return decoded
}
