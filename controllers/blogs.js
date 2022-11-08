const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  // If likes field is not defined, give it a value of zero
  const blog = request.body.likes
    ? new Blog(request.body)
    : new Blog({
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: 0
    })

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

module.exports = blogsRouter