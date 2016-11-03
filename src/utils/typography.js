import Typography from 'typography'
import theme from './typography-theme'
// theme.blockMarginBottom = 0

const typography = new Typography(theme)
typography.overrideStyles = ({ rhythm }, options) => ({
  'img': {
  }
})
// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
