const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  }
  else {
    return blogs.reduce((sum, blog) => {
      return sum + blog.likes
    }, 0)
  }
}

module.exports = {
  dummy,
  totalLikes
}

