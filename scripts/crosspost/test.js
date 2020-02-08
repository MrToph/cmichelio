const publish = async post => {
  const { content, ...restPost } = post
  console.log(content)
  console.log(JSON.stringify(restPost))

  return { url: `XXX`}
}

module.exports = publish
