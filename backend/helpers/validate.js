const validator = require("validator");

/**Función que valida los datos de registro de usuarios
 * @param {Object} data - Objeto con los datos a validar
 * @returns {Boolean} - Devuelve true si los datos son válidos
 */
const validate = (data) => {
  const name = !validator.isEmpty(data.name) && 
    validator.isLength(data.name, { min: 3, max: undefined }) && 
    validator.isAlpha(data.name, 'es-ES')
  
  const nick = !validator.isEmpty(data.nick) && 
      validator.isLength(data.nick, { min: 3, max: 30 }) 

  const email = !validator.isEmpty(data.email) &&
    validator.isEmail(data.email)

  const password = !validator.isEmpty(data.password) &&
    validator.isLength(data.password, { min: 6, max: undefined }) 

  if(data.surname){
    const surname = !validator.isEmpty(data.surname) && 
      validator.isLength(data.surname, { min: 3, max: undefined }) && 
      validator.isAlpha(data.surname, 'es-ES')
    if(!surname) throw new Error('Surname is not valid!')
  }

  if(!name) throw new Error('Name is not valid')
  if(!nick) throw new Error('Nick is not valid')
  if(!email) throw new Error('Email is not valid')
  if(!password) throw new Error('Password is not valid')
  else return true
}

module.exports = {
  validate
}