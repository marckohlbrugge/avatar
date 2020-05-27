const crypto = require('crypto')

const sharp = require('sharp')
const Color = require('color')

const svg = require('./svg')
const helper = require('./helper')

function generateGradient(username, text, width, height, textLength = null, color = null) {
  const hash = crypto.createHash('md5').update(username).digest('hex')

  let backgroundColor = helper.hashStringToColor(hash)
  backgroundColor = new Color(backgroundColor).saturate(0.5)

  const lightning = backgroundColor.hsl().color[2]
  if (lightning < 25) {
    backgroundColor = backgroundColor.lighten(3)
  }
  if (lightning > 25 && lightning < 40) {
    backgroundColor = backgroundColor.lighten(0.8)
  }
  if (lightning > 75) {
    backgroundColor = backgroundColor.darken(0.4)
  }

  if (color) {
    textColor = new Color(color)
    backgroundColor = new Color(color).darken(0.5)
  } else {
    textColor = helper.getMatchingColor(backgroundColor)
  }

  let avatar = svg.replace(/(\$FIRST)/g, backgroundColor.hex())
  avatar = avatar.replace('$SECOND', textColor.hex())

  avatar = avatar.replace(/(\$WIDTH)/g, width)
  avatar = avatar.replace(/(\$HEIGHT)/g, height)

  avatar = avatar.replace(/(\$TEXT)/g, text)

  textLength = textLength ? textLength : Math.max(text.length, 2)

  avatar = avatar.replace(/(\$FONTSIZE)/g, (height * 0.9) / textLength)

  if(username == "/white") {
    avatar = avatar.replace(/<rect .*>/, "")
  }

  return avatar
}

function parseSize(size) {
  const maxSize = 1000
  if (size && size.match(/^-?\d+$/) && size <= maxSize) {
    return parseInt(size, 10)
  }
  return 120
}

exports.generateSVG = function(username, text, width, height, textLength, color) {
  width = parseSize(width)
  height = parseSize(height)
  return generateGradient(username, text, width, height, textLength, color)
}

exports.generatePNG = function(username, width, height, textLength, color) {
  width = parseSize(width)
  height = parseSize(height)
  const svg = generateGradient(username, '', width, height, textLength, color)
  return sharp(new Buffer(svg)).png()
}
