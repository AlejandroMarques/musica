const {validate} = require('../helpers/validate')
const {checkDocumentExistance, saveDocument, findDocumentById, updateDocument, uploadDocument, } = require('../helpers/mongoose')
const {checkParams, cleanDocument, media} = require('../helpers/general')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwtService = require("../services/jwt");

const test = (req, res) => {
  return res.status(200).json({
    status: 'Success',
    message: 'User test!'
  })
}

const register = async(req, res) => {
  const params = req.body

  //Comprobar parametros
  const paramsToCheck = ['name', 'nick', 'email', 'password']
  const resultCheck = checkParams(params, paramsToCheck)
  if(resultCheck.status === 'error') return res.status(400).json(resultCheck)

  //Validar parametros
  try {
    const isValid = validate(params)
    if(!isValid) return res.status(400).json({ status: "error", message: "Invalid parameters" });
  } catch (error) {
    return res.status(400).json({
      status: 'Error',
      message: error.message
    })    
  }

  //Controlar usuarios duplicados
  const filter = {$or:[{ email: params.email.toLowerCase() },{ nick: params.nick.toLowerCase() },]}
  const {exist} = await checkDocumentExistance(User, filter)
  if (exist) return res.status(500).json({ status: "error", message: "User alredy exists" });

  //Cifrar la contraseña
  const password = await bcrypt.hash(params.password, 10)
  params.password = password

  //Crear el usuario
  const user = new User(params)

  //Guardar el usuario
  const result = await saveDocument(user).catch((err) => {
    return res.status(500).json(err)
  });
  result.doc = cleanDocument(result.doc, ['password', 'role'])
  return res.status(200).json(result);
}

const login = async (req, res) => {
  const params = req.body;

  //Comprobar parametros
  const paramsToCheck = ['email', 'password']
  const resultCheck = checkParams(params, paramsToCheck)
  if(resultCheck.status === 'error') return res.status(400).json(resultCheck)

  try {
    //Comprobar si existe el usuario
    const {exist, docs} = await checkDocumentExistance(User, {$or: [{ email: params.email }]})
    const user = docs[0];
    if (!exist) return res.status(500).json({ status: "error", message: "User does not exists" });
  
    //Comprobar la contraseña
    const correct = bcrypt.compareSync(params.password, user.password);
    if (!correct) return res.status(500).json({ status: "error", message: "Wrong password" });
  
    //Generar token
    const token = jwtService.generateToken(user);

    //Limpiar respuesta
    const userToShow = cleanDocument(user, ['password', 'role'])

    return res.status(200).json({ 
      status: 'success',
      message: "Login correctly", 
      user: userToShow, 
      token
    });
  } catch (error) {
    return res.status(500).json(error)
  }
};

const profile = async (req, res) => {
  //Sacamos el id del usuario
  const id = req.params.id;

  //Generamos el select para no mostrar la contraseña ni el rol
  const select = { password: 0, role: 0 };

  //Buscamos el usuario
  const {user} = await findDocumentById(User, id, select).catch((err) => {
    return res.status(500).json(err);
  })
  return res.status(200).json({ status: "success", user });
}

const update = async (req, res) => {
  const userIdentity = req.user;
  const userToUpdate = req.body;

  const array = []
  if(userToUpdate.email) array.push({ email: userToUpdate.email.toLowerCase() })
  if(userToUpdate.nick) array.push({ nick: userToUpdate.nick.toLowerCase() })
  const filter = {$or:array}
  try{
    if(array.length > 0) {
      const {docs} = await checkDocumentExistance(User, filter)
    
      const exist = docs.some((user) => user._id.toString() !== userIdentity.id);
    
      if(exist) return res.status(500).json({ status: "error", message: "User alredy exists" });
    }
  
    if(userToUpdate.password !== userIdentity.password){
      userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10); 
    }
    else delete userToUpdate.password;
    const user = await updateDocument(User, {_id: userIdentity.id}, userToUpdate)
    return res.status(200).json({ status:'succes', message: "User updated", user: cleanDocument(user, ['password', 'role']) });
  } catch(error){
    return res.status(500).json(error);
  }
}

const upload = async (req, res) => {
  const result = await uploadDocument(User, {_id: req.user.id}, {image: req.file.filename}, req.file, ['png', 'jpg', 'jpeg', 'gif']).catch((err) => {
    return res.status(500).json(err);
  })
  return res.status(200).json(result);
}

const avatar = async (req, res) => {
  const result = await media(req.params.file, './uploads/avatars').catch((err) => {
    return res.status(500).json(err);
  });
  res.sendFile(result);
}


module.exports = {
  test,
  register,
  login,
  profile,
  update,
  upload,
  avatar
}