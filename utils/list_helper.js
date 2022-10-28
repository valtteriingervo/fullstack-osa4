const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  }

  return blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)
}

const favoriteBlog = (blogs) => {

  if (blogs.length === 0) {
    return null
  }

  const maxLikes = Math.max(...blogs.map(blog => blog.likes))
  // Enough to find some blog that has as many likes as maxLikes
  return blogs.find(blog => blog.likes === maxLikes)
}

// Return the author object with the most blogs
const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const authorsCount = blogs.map(blog => blog.author)
  const uniqueAuthors = _.uniq(authorsCount)

  const blogsByAuthor = uniqueAuthors.reduce((objArray, author) => {
    objArray.push({
      author: author,
      blogs: blogs.filter(blog => blog.author === author).length
    })

    return objArray
  }, [])

  const maxBlogs = Math.max(...blogsByAuthor.map(authorObj => authorObj.blogs))

  return blogsByAuthor.find(authorObj => authorObj.blogs === maxBlogs)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}

