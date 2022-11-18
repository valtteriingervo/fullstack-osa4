const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  // If no title or URL given, return 400 bad request
  if (!(body.title && body.url)) {
    response.status(400).end()
  }
  else {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = body.likes
      ? new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
      })
      : new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: 0, // If likes field is not defined, give it a value of zero
        user: user._id
      })

    const savedBlog = await blog.save()
    // the blog must be saved also to the user document
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  }
})

// 4.21: Deletion should only be possible by the user who added the blog
blogsRouter.delete('/:id', async (request, response) => {
  // Check for token validity
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  // Fetch the blog by the given id
  const blog = await Blog.findById(request.params.id)
  // Fetch the user with the given token
  const user = await User.findById(decodedToken.id)

  // The users ID must match the one in the blog
  if (blog.user._id.toString() === user._id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    return response.status(204).end()
  }
  else {
    return response.status(401).json({ error: 'only user who added the blog can delete it' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    likes: body.likes
  }

  const updatedBlog =
    await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })

  response.json(updatedBlog)
})

module.exports = blogsRouter