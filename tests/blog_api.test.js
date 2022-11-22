const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')


describe.only('blogs are received in correct format and quantity', () => {
  // Scope beforeEach only to this describe block
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
})

// A bit shady global variable use but token needs to be available
// for multiple tests in different describe blocks
let userToken

const initUser = async () => {
  // Delete possible previous users and blogs before tests
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Manually create and save a new user
  const newUser = new User({
    username: 'skaterBoy98',
    name: 'John Dewey',
    passwordHash: await bcrypt.hash('password', 10)
  })

  await newUser.save()

  const userDetails = {
    username: newUser.username,
    id: newUser._id
  }
  // Assign the token for the global variable
  userToken = jwt.sign(userDetails, process.env.SECRET)
}

describe.only('adding of blogs', () => {

  beforeEach(async () => {
    await initUser()
  })

  test('a valid blog can be added', async () => {

    const validBlog = {
      title: 'Hunting Blog',
      author: 'Johanna Newsom',
      url: 'https://rifle-by-my-side.com',
      likes: 88
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${userToken}`)
      .send(validBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(1)

    const blogTitles = blogsAtEnd.map(blog => blog.title)
    expect(blogTitles).toContain(validBlog.title)

  })

  test('receive 401 unauthorized if no token in request', async () => {
    const validBlog = {
      title: 'Hunting Blog',
      author: 'Johanna Newsom',
      url: 'https://rifle-by-my-side.com',
      likes: 88
    }

    await api
      .post('/api/blogs')
      .send(validBlog) // Leave out Authorization header
      .expect(401)
  })
})

describe.only('handling of missing blog fields or values', () => {
  beforeEach(async () => {
    await initUser()
  })

  test('value of 0 given to blog without likes set', async () => {
    const blogWithoutLikesValue = {
      title: 'Hunting Blog',
      author: 'Johanna Newsom',
      url: 'https://rifle-by-my-side.com'
    }

    await api
      .post('/api/blogs')
      .send(blogWithoutLikesValue)
      .set('Authorization', `bearer ${userToken}`)
      .expect(201) // expect 201 created
      .expect('Content-Type', /application\/json/)

    // There should be one blog in DB
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(1)

    // Likes field should be defined for all the blogs in DB
    blogsAtEnd.forEach(blog => {
      expect(blog.likes).toBeDefined()
    })

    // Likes field value should be 0 for the last blog added
    const lastBlog = await helper.lastBlogAddedInDb()
    expect(lastBlog.likes).toBe(0)
  })

  // 4.12 tests
  test('blog added without title and url receives 400 bad request', async () => {
    const blogWithoutTitleAndUrl = {
      author: 'Jeremiah Burner',
      likes: 12
    }

    await api
      .post('/api/blogs')
      .send(blogWithoutTitleAndUrl)
      .set('Authorization', `bearer ${userToken}`)
      .expect(400) // Expect 400 bad request
  })

  test('blog added without title receives 400 bad request', async () => {
    const blogWithoutTitle = {
      author: 'Jeremiah Burner',
      url: 'https://myhouseisonfire.com',
      likes: 12
    }

    await api
      .post('/api/blogs')
      .send(blogWithoutTitle)
      .set('Authorization', `bearer ${userToken}`)
      .expect(400) // Expect 400 bad request
  })

  test('blog added without url receives 400 bad request', async () => {
    const blogWithoutTitle = {
      author: 'Jeremiah Burner',
      title: 'My house is on fire: How I learned to live with it',
      likes: 12
    }

    await api
      .post('/api/blogs')
      .send(blogWithoutTitle)
      .set('Authorization', `bearer ${userToken}`)
      .expect(400) // Expect 400 bad request
  })
})

describe('deleting blogs', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('changing existing blogs', () => {
  test('updating likes for certain blog should work', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedLikesBlog = {
      ...blogToUpdate,
      likes: 890
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedLikesBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    // The length of blogs should be the same
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    // The blog should now have the updated likes
    const putBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
    expect(putBlog.likes).toBe(updatedLikesBlog.likes)

  })
})

describe('missing or too short values for user fields', () => {
  test('adding duplicate username should return 400', async () => {
    const invalidUser = {
      username: 'blogLover',
      name: 'Ilmari Juurinen',
      password: 'juures_nauris'
    }

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)

    const names = usersAtEnd.map(user => user.name)
    expect(names).not.toContain(invalidUser.name)
  })

  test('username missing should return 400', async () => {
    const noUsernameUser = {
      name: 'Ilmari Juurinen',
      password: 'juures_nauris'
    }

    await api
      .post('/api/users')
      .send(noUsernameUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)

    const names = usersAtEnd.map(user => user.name)
    expect(names).not.toContain(noUsernameUser.name)
  })

  test('password missing should return 400', async () => {
    const noPasswordUser = {
      username: 'ilmari_juuri98',
      name: 'Ilmari Juurinen',
    }

    await api
      .post('/api/users')
      .send(noPasswordUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)

    const names = usersAtEnd.map(user => user.name)
    expect(names).not.toContain(noPasswordUser.name)
  })

  test('too short username should return 400', async () => {
    const invalidUser = {
      username: 'i8',
      name: 'Ilmari Juurinen',
      password: 'juures_nauris'
    }

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)

    const names = usersAtEnd.map(user => user.name)
    expect(names).not.toContain(invalidUser.name)
  })

  test('too short password should return 400', async () => {
    const invalidUser = {
      username: 'ilmari_juuri98',
      name: 'Ilmari Juurinen',
      password: 'ju'
    }

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)

    const names = usersAtEnd.map(user => user.name)
    expect(names).not.toContain(invalidUser.name)
  })

  test('both username and password missing should return 400', async () => {
    const invalidUser = {
      name: 'Ilmari Juurinen',
    }

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)

    const names = usersAtEnd.map(user => user.name)
    expect(names).not.toContain(invalidUser.name)
  })

  test('exactly 3 character username and password should result in 201 created', async () => {
    const invalidUser = {
      username: 'i98',
      name: 'Ilmari Juurinen',
      password: 'juu'
    }

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(201)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1)

    const names = usersAtEnd.map(user => user.name)
    expect(names).toContain(invalidUser.name)
  })
})

afterAll(() => {
  mongoose.connection.close()
})