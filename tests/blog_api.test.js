const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

// 4.8 tests
test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('correct amount of blogs is returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(5)
})

// 4.9 test
test('identifying field of blogs is called id', async () => {
  const response = await api.get('/api/blogs')

  const blogs = response.body

  blogs.forEach(blog => {
    expect(blog.id).toBeDefined()
  })
})

// 4.10 test
test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Cooking blog',
    author: 'Saman Nashtri',
    url: 'http://get-cooking.com',
    likes: 28,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201) // expect 201 Created
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const blogTitles = blogsAtEnd.map(blog => blog.title)
  expect(blogTitles).toContain('Cooking blog')

})

// 4.11 test
test('if no value given to likes, give it value of 0', async () => {
  const blogWithoutLikesValue = {
    title: 'Hunting Blog',
    author: 'Johanna Newsom',
    url: 'https://rifle-by-my-side.com'
  }

  await api
    .post('/api/blogs')
    .send(blogWithoutLikesValue)
    .expect(201) // expect 201 created
    .expect('Content-Type', /application\/json/)

  // There should be one more blog in the database
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  // Likes field should be defined for all the blogs in DB
  blogsAtEnd.forEach(blog => {
    expect(blog.likes).toBeDefined()
  })

  // Likes field value should be 0 for the last blog added
  const lastBlog = await helper.lastBlogAddedInDb()
  expect(lastBlog.likes).toBe(0)

})

afterAll(() => {
  mongoose.connection.close()
})