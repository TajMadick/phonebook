const express = require('express');
const logger = require('morgan');
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



let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
  const date = Date()
  response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
  response.write(`<p>Phonebook has info for ${persons.length} people</p>`)
  response.write(`<p>${date}</p>`)
  response.end()

})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  person = persons.find(person => person.id === id)
  person
  ? response.json(person)
  : response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body;
  const id = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  if (!body.name || !body.number)
  {
    return response.status(400).json({ 
      error: 'Name or number is missing'
    })
  }
  if (persons.find(person => person.name === body.name) !== undefined)
  {
    return response.status(409).json({ 
      error: 'Name must be unique'
    })
  }

  newPerson = {
    id: id,
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson)

  response.json(newPerson);
})

app.put('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const existingPerson = persons.find(person => person.id === id);

  existingPerson.number = request.body.number ?? existingPerson.number;

  response.json(existingPerson);
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})