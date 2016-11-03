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

typography.pixelToRhythm = function(pixels) {
	// one rhythm is one baseLineHeight interpreted as rem
	// one rem is baseFontSize (baseFontSize is given as string `${pixels}px`)
	let baseFontPixels = parseInt(theme.baseFontSize.slice(0, -2))	// strip 'px' off
	let baseLineHeightAsPixels = baseFontPixels * theme.baseLineHeight // one rhythm equals this many pixels
	console.log(theme.baseLineHeight, theme.baseFontSize, baseFontPixels, typography.rhythm(1))
	return pixels / baseLineHeightAsPixels
}

export default typography
