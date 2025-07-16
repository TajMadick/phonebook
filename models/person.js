const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    required: [true, 'Name is required']
  },
  number: {
    type: String,
    minLength: 2,
    required: [true, 'Phone Number is required'],
    validate: {
      validator: (v) => /[+]\d{2,3} \d+ \d*/.test(v),
      message: 'Format is incorrect. Exampleformat: +43 677 6781237222'
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)