const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
  {
    title: 'Blog about dogs',
    author: 'Matt Cannahan',
    url: 'http://dog-blog.com',
    likes: 7,
  },
  {
    title: 'Teen-lyfe',
    author: 'Johanna Juurikainen',
    url: 'http://teen-lyfe.com',
    likes: 14,
  },
  {
    title: 'Vihannesblogi',
    author: 'Jarmo Juurimies',
    url: 'http://porkkaanaa-ma-popsin.com',
    likes: 1,
  },
  {
    title: 'Car blog',
    author: 'Jack Smith',
    url: 'http://cool-cars-blog.com',
    likes: 52,
  },
  {
    title: 'Friendship blog',
    author: 'Jasmiina Yahlava',
    url: 'http://friends-are-forever.com',
    likes: 199,
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const lastBlogAddedInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.pop()
}

const blogByTitle = async (blogTitle) => {
  return await Blog.find({ title: blogTitle })
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  lastBlogAddedInDb,
  blogByTitle,
  usersInDb
}