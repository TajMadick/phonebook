require('dotenv').config()
const express = require('express');
const logger = require('morgan');
const Person = require('./models/person')

const app = express();

app.use(express.static('dist'))
app.use(express.json())

app.use(logger((tokens, req, res) => {
  return [
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'), '-',
  tokens['response-time'](req, res), 'ms',
  JSON.stringify(req.body)
].join(' ')
}))


app.get('/info', (request, response) => {
  const date = Date()
  Person.find({}).then(persons => {
    response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    response.write(`<p>Phonebook has info for ${persons.length} people</p>`)
    response.write(`<p>${date}</p>`)
    response.end()
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).json({ error: 'Please refresh page' })
      }
      person.name = name
      person.number = number

      return person.save()
        .then(updatedPerson => {
          response.json(updatedPerson)
        })
       .catch(error => next(error))     
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError'){
    return response.status(400).send({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})