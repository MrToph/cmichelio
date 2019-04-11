export const isClientSide = () =>
  Boolean(
    typeof window !== `undefined` &&
    window.document &&
    window.document.createElement
  )
