const fs = require("fs");
const path = require("path");

const checkParams = (params, paramsToCheck) => {
  if(!params) throw new Error('Params is undefined')
  if(!paramsToCheck) throw new Error('There are no params to check')
  for (const param of paramsToCheck) {
    if(!params[param]) return ({ status: "error", message: `Missing ${param} parameter` });
  }
  return { status: "success", message: "Parameters are correct" };
}

const cleanDocument = (doc, paramsToDelete) => {
  if(!doc) throw new Error('Document is undefined')
  if(!paramsToDelete) throw new Error('There are no params to hide')
  doc = doc.toObject()
  for (const param of paramsToDelete) {
    delete doc[param]
  }
  return doc
}

const media = async (file, pathToFolder, property = 'image') => {
  return new Promise (async (resolve, reject) => {
    const pathFile = `${pathToFolder}/${file}`;
    fs.promises.stat(pathFile).then((stats) => {
        if (!stats) reject({status: 'success', message:`Image not found with id ${req.params[property]}`});
        resolve(path.resolve(pathFile));
      }).catch((error) => {
        reject({ status: "error", message: error.message });
      });
  })
}

module.exports = {
  checkParams,
  cleanDocument,
  media,
}