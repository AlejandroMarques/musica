const fs = require("fs");
const path = require("path");
const paginate = require("mongoose-pagination");

/**Función que comprueba si existe un documento cualquiera en la base de datos
 * @param {Model} model - Modelo a buscar
 * @param {Array} filter - (Opcional) Array de filtros para la búsqueda, si se deja en null lista toda la collección
 * @param {Object} select - (Opcional) Objeto con los campos a ocultar en la respuesta
 * @param {String} sortBy - (Opcional) Valor por el cual se ordena la lista, por defecto es _id
 * @param {Number} page - (Opcional) Página a listar, por defecto es 1
 * @param {Number} itemsPerPage - (Opcional) Cantidad de documentos por página, por defecto es 5
 * @returns {Object} - Objeto que devuelve dos campos: exist (boolean) y docs (array de documentos)
 */
const findDocuments = (model, options = {filter: {}, select: {}, sortBy: '_id', page: 1, itemsPerPage: 5} ) => {
  return new Promise ((resolve, reject) => {
    const {filter, select, sortBy, page, itemsPerPage} = options;
    const collectionName = model.collection.collectionName.toString();
    model.find(filter).select(select).sort(sortBy).paginate(Number(page), Number(itemsPerPage)).then(async (docs) => {
      if(!docs) reject({ status: "error", message: `No ${collectionName} found` });
      
      const total = await model.countDocuments({}).exec()
  
      resolve({ status: "success", page, [collectionName]: docs, total, pages: Math.ceil(total/itemsPerPage) });
    }).catch((err) => {
      reject({ status: "error", message: `Error listing ${collectionName}: ${err}` });
    })
  })
}

/**Función que comprueba si existe un documento cualquiera en la base de datos
 * @param {Model} model - Modelo a buscar
 * @param {String} populate - Propiedad a popular en la respuesta
 * @param {Array} filter - (Opcional) Array de filtros para la búsqueda, si se deja en null lista toda la collección
 * @param {Object} select - (Opcional) Objeto con los campos a ocultar en la respuesta
 * @param {String} sortBy - (Opcional) Valor por el cual se ordena la lista, por defecto es _id
 * @param {Number} page - (Opcional) Página a listar, por defecto es 1
 * @param {Number} itemsPerPage - (Opcional) Cantidad de documentos por página, por defecto es 5
 * @returns {Object} - Objeto que devuelve dos campos: exist (boolean) y docs (array de documentos)
 */
const findDocumentsAndPopulate = (model, options = {populate, filter: {}, select: {}, sortBy: '_id', page: 1, itemsPerPage: 5} ) => {
  return new Promise ((resolve, reject) => {
    const {populate, filter, select, sortBy, page, itemsPerPage} = options;
    const collectionName = model.collection.collectionName.toString();
    model.find(filter).populate(populate).select(select).sort(sortBy).paginate(Number(page), Number(itemsPerPage)).then(async (docs) => {
      if(!docs) reject({ status: "error", message: `No ${collectionName} found` });
      
      const total = await model.countDocuments({}).exec()
  
      resolve({ status: "success", page, [collectionName]: docs, total, pages: Math.ceil(total/itemsPerPage) });
    }).catch((err) => {
      reject({ status: "error", message: `Error listing ${collectionName}: ${err}` });
    })
  })
}



/**Función que comprueba si existe un documento cualquiera en la base de datos
 * @param {Model} model - Modelo a buscar
 * @param {Array} filter - Array de filtros para la búsqueda
 * @param {Object} select - (Opcional) Objeto con los campos a ocultar en la respuesta
 * @returns {Object} - Objeto que devuelve dos campos: exist (boolean) y docs (array de documentos)
 */
const checkDocumentExistance = (model, filter, select = {}) => {
  return new Promise ((resolve, reject) => {
    model.find(filter).select(select)
    .then((docs) => {
      if(!docs) reject({ status: "error", message: `${model.collection.modelName} not found` })
      resolve({exist : docs.length >= 1, docs});
    }).catch((err) => {
      reject(err);
    });
  })
};

/**Función que actualiza un documento cualquiera en la base de datos
 * @param {Model} model - Modelo a actualizar
 * @param {String} id - Id del documento a actualizar
 * @param {Number} data - Objeto con los campos a actualizar
 * @returns {Model} - Devuelve el documento actualizado
 */
const updateDocument = (model, id, data) => {
  return new Promise ((resolve, reject) => {
    model.findByIdAndUpdate(id, data, { new: true })
    .then((doc) => {
      if (!doc) {
        reject({ status: "error", message: `${model.collection.modelName} not found` });
      }
      resolve(doc);
    }).catch((err) => {
      reject({ status: "error", message: `Error updating ${model.collection.modelName}: ${err}` });
    })
  })
}

/**Función que guarda un documento cualquiera en la base de datos
 * @param {Model} model - Modelo a guardar
 * @returns {Object} - Devuelve un objeto con el documento actualizado en la propiedad doc
 */
const saveDocument = (model) => {
  return new Promise ((resolve, reject) => {
    model
      .save()
      .then((docStored) => {
        resolve({ status: "success", message: `${model.collection.modelName} saved`, doc: docStored });
      })
      .catch((err) => {
        reject({ status: "error", message: `Error saving ${model.collection.modelName}: ${err}` });
      });
  })
};

/**Función que elimina todos los documento que cumplan un criterio en la base de datos
 * @param {Model} model - Modelo a eliminar
 * @param {Array} filter - Array de filtros para la búsqueda
 * @returns {Object} - Devuelve el objeto eliminado
 */
const deleteDocuments =  (model, filter) => {
  return new Promise ((resolve, reject) => {
    if(!filter) reject({ status: "error", message: `No filter provided` })
    model.find(filter).then(async(docs) => {
      if (!docs) {
        reject({ status: "error", message: `${model.collection.modelName} not found` });
      }
      await model.deleteMany(filter)
      resolve(docs);
    }).catch((err) => {
      reject({ status: "error", message: `Error deleting ${model.collection.modelName}: ${err}` });
    })
  })
}

/**Función que guarda en un path un archivo multimedia cualquiera y vincula ese path un documento 
 * @param {Model} model - Documento a vincular el path
 * @param {Array} filter - Array de filtros para la búsqueda
 * @param {Object} data - Objeto con los campos a actualizar
 * @param {Object} file - Archivo a guardar
 * @param {Array} file - (Opcional) Array de archivos a guardar
 * @param {Array} fileTypes - Array de extensiones permitidas
 * @returns {Object} - Devuelve un objeto con el archivo guardado en la propiedad file y el documento actualizado en la propiedad con el nombre del modelo
 */
const uploadDocument = async(model, filter, data, files, fileTypes = []) => {
  return new Promise (async (resolve, reject) => {
    try {
      if (!files) reject({ status: "error", message: "No file uploaded" });
      if(!Array.isArray(files)) files = [files];
      for (const file of files) {
        const fileName = file.originalname;
        const splitName = fileName.split(".");
        const extension = splitName[splitName.length - 1];
    
        if (fileTypes.length > 0 && !fileTypes.includes(extension)) {
          const filePath = file.path;
          const fileDeleted = fs.unlink(filePath);
          resolve({
            status: "error",
            fileDeleted,
            message: "Invalid file type",
          });
        }
      }
      const doc = await updateDocument(model, filter, data).catch((err) => {
        reject(err);      
      });
      resolve({ status: "success", message: "File uploaded", [model.collection.modelName]: doc, files });
    } catch (error) {
      reject({ status: "error", message: error.message });
    }
  })
}

/**Función que guarda en un path un archivo multimedia cualquiera y vincula ese path un documento 
 * @param {Model} model - Documento a vincular el path
 * @param {String} id - Id del objeto a buscar
 * @param {Object} select - (Opcional) Objeto con los campos a ocultar en la respuesta
 * @returns {Object} - Devuelve un objeto con el documento en la propiedad con el nombre del modelo y un status
 */
const findDocumentById = (model, id, select = {}) => {
  return new Promise (async (resolve, reject) => {
    model.findById(id).select(select).then(async (doc) => {
      if (!doc) {
        reject({ status: "error", message: `${model.collection.modelName} with id ${id} not found`});
      }
      return resolve({ status: "success", [model.collection.modelName.toLowerCase()]: doc});
    }).catch((err) => {
      return reject({ status: "error", message: `Error searching ${model.collection.modelName}: ${err}` });
    })
  })
}

/**Función que guarda en un path un archivo multimedia cualquiera y vincula ese path un documento 
 * @param {Model} model - Documento a vincular el path
 * @param {String} id - Id del objeto a buscar
 * @param {String} populate - Propiedad a popular en la respuesta
 * @param {Object} select - (Opcional) Objeto con los campos a ocultar en la respuesta
 * @returns {Object} - Devuelve un objeto con el documento en la propiedad con el nombre del modelo y un status
 */
const findByIdAndPopulate = (model, id, select = {}, populate = {}) => {
  return new Promise (async (resolve, reject) => {
    model.findById(id).populate(populate).select(select).then(async (doc) => {
      if (!doc) {
        reject({ status: "error", message: `${model.collection.modelName} with id ${id} not found`});
      }
      return resolve({ status: "success", [model.collection.modelName.toLowerCase()]: doc});
    }).catch((err) => {
      return reject({ status: "error", message: `Error searching ${model.collection.modelName}: ${err}` });
    })
  })
}

module.exports = {
  findDocuments,
  findDocumentsAndPopulate,
  checkDocumentExistance,
  updateDocument,
  saveDocument,
  deleteDocuments,
  uploadDocument,
  findDocumentById,
  findByIdAndPopulate
}