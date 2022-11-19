const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {

  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }
  else {
    request.token = null
  }

  // Move control to the next middleware
  next()
}

const userExtractor = async (request, response, next) => {
  // Check that request token exists and points to a valid user
  if (!request.token) {
    return response.status(401).json({ error: 'token missing' })
  }
  // Check for token validity
  let decodedToken
  try {
    decodedToken = jwt.verify(request.token, process.env.SECRET)
    // If there is no errors in jwt.verify, decodedToken.id is valid
    // If there are errors, then the code execution jumps to the catch block and the line below is not executed
    const user = await User.findById(decodedToken.id)
    // insert user into the request object
    request.user = user

    // Move control to the next middleware
    next()
  }
  catch (error) { // Catch errors in jwt.verify, e.g. invalid token and pass it to the error handler middleware
    next(error)
  }
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}