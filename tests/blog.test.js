const listHelper = require('../utils/list_helper')

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  test('when list has only one blog equals the likes of that',
    () => {
      const singleBlog =
      {
        _id: '5a422b891b54a676234d17fa',
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        likes: 10,
        __v: 0
      }
      expect(listHelper.totalLikes([singleBlog])).toBe(10)
    })

  test('of a bigger list is calculated right', () => {
    expect(listHelper.totalLikes(blogs)).toBe(36)
  })
})

describe('favorite blog', () => {
  test('of empty list is null', () => {
    expect(listHelper.favoriteBlog([])).toBe(null)
  })

  test('of single blog is the blog itself', () => {
    expect(listHelper.favoriteBlog([blogs[3]])).toEqual(blogs[3])
  })

  test('of multiple blogs is the one, or one of, with the most likes', () => {
    expect(listHelper.favoriteBlog(blogs)).toEqual(blogs[2])
  })
})

describe('most blogs', () => {
  test('empty blog list should result in null', () => {
    expect(listHelper.mostBlogs([])).toBe(null)
  })
  test('single blog should return that author and have one blog for them', () => {
    const singleBlogReturn = {
      author: blogs[0].author,
      blogs: 1
    }
    expect(listHelper.mostBlogs([blogs[0]])).toEqual(singleBlogReturn)
  })
  test('multiple blogs should return the author info with most blogs', () => {
    const correctBlogReturn = {
      author: 'Robert C. Martin',
      blogs: 3
    }
    expect(listHelper.mostBlogs(blogs)).toEqual(correctBlogReturn)
  })
})

describe('most likes', () => {
  test('empty array should result in null', () => {
    expect(listHelper.mostLikes([])).toBe(null)
  })
  test('single blog should return that blogs author and likes', () => {
    const correctBlogReturn = {
      author: 'Michael Chan',
      likes: 7
    }
    expect(listHelper.mostLikes([blogs[0]])).toEqual(correctBlogReturn)
  })
  test('of multiple blogs should be returned the one blog, or one of, with the most likes', () => {
    const correctBlogReturn = {
      author: 'Edsger W. Dijkstra',
      likes: 17
    }
    expect(listHelper.mostLikes(blogs)).toEqual(correctBlogReturn)
  })
})