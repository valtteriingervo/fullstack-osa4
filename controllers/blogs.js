const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  // If no title or URL given, return 400 bad request
  if (!(body.title && body.url)) {
    response.status(400).end()
  }
  else {
    // If likes field is not defined, give it a value of zero
    const blog = body.likes
      ? new Blog(body)
      : new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: 0
      })

    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter