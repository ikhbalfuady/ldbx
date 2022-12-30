/* LDBX Version 1.1.4
Author : ikhbalfuady@gmail.com
This some utilities script to help you manage localStorage data
the style syntax similary like laravel eloquent to help you easy to understod the query
avail to save, update, delete, get all & get single 
*/

/* LocalStorage Helper */
class DB {
  constructor() {
    if (typeof(Storage) !== "undefined") {
      // console.log('LocalStorage initialize')
      return true
    } else {
      alert('Sorry! No Web Storage support..')
      return false
    }
  }

  valueFormater (val) {
    if (val === 'true') return true
    if (val === 'false') return false
    if (!isNaN(val)) return Number(val)
    return val
  }

  getFormat (val) {
    var res = 'str'
    if (typeof(val) === 'number') res = 'num'
    if (typeof(val) === 'object') res = 'obj'
    if (typeof(val) === 'boolean ') res = 'bol'
    return res
  }

  setter (data) {
    var format = this.getFormat(data)
    if (format == 'obj') data = JSON.stringify(data)
    var val = format + '|' + data
    return val
  }

  formater(val) {
    if (!val) {
      console.warn('failed to extract data', val)
      return null
    }
  
    const [format, value] = val.split("|");
    if (format === 'obj') return JSON.parse(value);
    if (format === 'num') return parseFloat(value);
    if (format === 'bol') return value === 'true';
    return value;
  }

  save (key, value) {
    localStorage.setItem(key, this.setter(value))
  }

  get (key) {
    var val = localStorage.getItem(key)
    val = this.formater(val)
    return val
  }

  remove (key) {
    return localStorage.removeItem(key)
  }
}

/* Eloquent */
class Model {
  constructor(tableName = null, showLog = true) {
    this.showLog = showLog // log performance
    this.tableName = tableName // localstorage key name

    /* whereCondition : arrayObject
      N   : IS NULL
      NN  : NOT NULL
      NIN : NOT IN
      {
        key     : String,
        operator: Enum(=, >, >=, <, <, like, N, NN, IN, NIN)
        value   : String,Number,
      }
    */
    this.whereCondition = []

    /* orderCondition : arrayObject
      {
        key   : String,
        type  : Enum('asc','desc),
      }
    */
    this.orderCondition = []

    /* belongsToRelation & hasManyRelation : arrayObject
      {
        tableName     : String,
        foreignKey    : String,
        newObjectName : String,
        targetKey     : String
      }
    */
    this.belongsToRelation = []
    this.hasManyRelation = []

    /* LocalStorage Instance */
    this.DB = new DB()
  }

  // Utilities
  UUID (separator = '') {
    var rand = Math.random

    var nbr, randStr = ""
      do {
          randStr += (nbr = rand()).toString(16).substr(3, 6)
      } while (randStr.length < 30)
      return (
          randStr.substr(0, 8) + separator +
          randStr.substr(8, 4) + separator + "4" +
          randStr.substr(12, 3) + separator +
          ((nbr*4|0)+8).toString(16) + // [89ab]
          randStr.substr(15, 3) + separator +
          randStr.substr(18, 12)
      )
  }

  console (msg, type = 'info') {
    var theme = {
      info : { color: '#041b24', background: '#2ba6d6'},
      warning : { color: '#041b24', background: '#f5ab00'},
      success : { color: '#041b24', background: '#0fd644'},
      danger : { color: '#fff', background: '#f00702'},
    }
    const styles = [
      `color: ${theme[type].color}`,
      `background: ${theme[type].background}`,
      'font-size: 11px',
      'padding: 5px',
    ].join(';'); // 2. Concatenate the individual array item and concatenate them into a string separated by a semi-colon (;)

    // 3. Pass the styles variable
    var csl = '%c'+ '[LDBX]⇒ ' +msg
    if (this.showLog ) {
      if (type === 'info') console.info(csl, styles)
      else if (type === 'warning') console.warn(csl, styles)
      else if (type === 'danger') console.error(csl, styles)
      else console.debug(csl, styles)
    }
  }

  /* 
    fillableColumns : ['id', 'name', 'code']
  */
  fixStructure (fillableColumns) {
    var data = this.fetch(this.tableName) || [];
    const hasId = fillableColumns.includes('id');
    if (!hasId) fillableColumns.push('id');
  
    data = data.map(row => {
      const fixRow = {};
      fillableColumns.forEach(col => {
        fixRow[col] = row[col] || null;
      });
      return fixRow;
    });

    this.DB.save(this.tableName, data) // commiting
    console.info(`Success updating structure [${this.tableName}]`, fillableColumns, data)
  }

  /* criteria = whereCondition */
  fetch (tableName, criteria = [], tag = '') {
    const start = performance.now()
    var table = this.DB.get(tableName)
    var data = null
    if (table) {
      if (criteria.length) data = this.query(table, criteria)
      else data = table
    }

    if (this.orderCondition.length) {
      for (let order of this.orderCondition) {
        data = this.sortBy(data, order.key, order.type)
      }
    }

    const end = performance.now()
    this.console(`${tag} Query ${data.length} of '${tableName}' Execution time: ${end - start} ms`, 'info')
    return data
  }

  sortBy(data, key, order = 'asc') {
    return data.sort((a, b) => {
      const aValue = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
      const bValue = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
      return aValue > bValue ? (order === 'asc' ? 1 : -1) : aValue < bValue ? (order === 'asc' ? -1 : 1) : 0;
    });
  }

  compareValues (key, order = 'asc') {
    return function(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;
      const aValue = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
      const bValue = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
      return aValue > bValue ? (order === 'asc' ? 1 : -1) : aValue < bValue ? (order === 'asc' ? -1 : 1) : 0;
    };
  }

  operator (operator, value, valueComparison) {
    var res = false
    if (operator === '=' && value === valueComparison) res = true
    if (operator === '>' && value > valueComparison) res = true
    if (operator === '>=' && value >= valueComparison) res = true
    if (operator === '<' && value < valueComparison) res = true
    if (operator === '<=' && value <= valueComparison) res = true
    if (operator === 'like' && value.includes(valueComparison)) res = true
		if (operator === 'N' && value === null) res = true // NULL
    if (operator === 'NN' && value !== null) res = true // NOT NULL
    if (Array.isArray(valueComparison) && operator === 'IN' && valueComparison.includes(value)) res = true // IN
    if (Array.isArray(valueComparison) && operator === 'NIN' && !valueComparison.includes(value)) res = true // NOT IN
    return res
  }

  query (data, criteria = []) {
    var countWhere = criteria ? criteria.length : 0
    if (countWhere === 0) return data
    var res = []
    var totalChecked = 0
    for (let val of data) {
      totalChecked = totalChecked + 1
      var match = 0
      for (let where of criteria) {
        var colVal = val[where.key]
        var value = where.value ? where.value : null
        if (this.operator(where.operator, colVal, value)) match = match + 1
      }
      if (match === countWhere) res.push(val)
    }
    // console.info(`querying ${totalChecked} of ${data.length} data`)
    return res
  }

  // chain
  orderBy (key, type = 'asc') {
    this.orderCondition.push({ key: key, type: type})
    return this
  }

  where (col, oprOrVal, value) {
    var criteria = {
      key: col,
      operator: value ? oprOrVal : '=',
      value: value ? value : oprOrVal,
    }

    if (oprOrVal.toLowerCase() === 'n') criteria = { key: col, operator: 'N', value: null}
    if (oprOrVal.toLowerCase() === 'nn') criteria = { key: col, operator: 'NN', value: null}
    if (oprOrVal.toLowerCase() === 'in') criteria = { key: col, operator: 'IN', value: value}
    if (oprOrVal.toLowerCase() === 'nin') criteria = { key: col, operator: 'NIN', value: value}

    this.whereCondition.push(criteria)
    return this
  }

  // relations
  collectRelation (data) {
    return data.map( obj => {
      if (this.belongsToRelation.length) obj = this.getRelation(obj, 'belongsTo')
      if (this.hasManyRelation.length) obj = this.getRelation(obj, 'hasMany')
      return obj
    })
  }

  getRelation(obj, type = 'belongsTo') {
    var relationMapName = `${type}Relation` 
    // if (!this[relationMapName]) return obj

    this[relationMapName].map(rel => {
      let objRel = this.fetch(rel.tableName, [{key: rel.targetKey, operator: '=', value: obj[rel.foreignKey]}])
      // console.info(`${type} ${rel.tableName} WHERE ${rel.targetKey} = ${obj[rel.foreignKey]}`)
      if (objRel && objRel.length) {
        if (type === 'belongsTo') obj[rel.newObjectName] = objRel[0]
        if (type === 'hasMany') obj[rel.newObjectName] = objRel
      }
    })
    return obj
  }

  belongsTo(tableName, foreignKey, newObjectName, targetKey = 'id') {
    var criteria = {
      tableName,
      foreignKey,
      newObjectName,
      targetKey
    }
    this.belongsToRelation.push(criteria)
    return this
  }

  hasMany(tableName, foreignKey, newObjectName, targetKey = 'id') {
    var criteria = {
      tableName,
      foreignKey,
      newObjectName,
      targetKey
    }
    this.hasManyRelation.push(criteria)
    return this
  }

  // trigger
  get () {
    var data = this.fetch(this.tableName, this.whereCondition)
    data = this.collectRelation(data)
    return data
  }

  first () {
    var data = this.fetch(this.tableName, this.whereCondition)
    data = this.collectRelation(data)
    return data.length ? data[0] : null 
  }

  find (id) {
    return this.where('id', id).first()
  }

  // commiting
  save (data) {
    let id = this.UUID()
    if (data.id) id = data.id
    const table = this.DB.get(this.tableName)
    const db = table ? [...table, { ...data, id }] : [{ ...data, id }] // merging 
    this.DB.save(this.tableName, db) // commiting
    this.console(`Success saving [${this.tableName}]`, 'success')
    return { ...data, id }
  }

  update (data) {
    var db = this.fetch(this.tableName, [])
    const index = db.findIndex(item => item.id === data.id);
    if (index >= 0) {
      db[index] = data
      // commiting
      this.DB.save(this.tableName, db)
      this.console(`Succes updating [${this.tableName}]`, 'success')
      return data
    } else {
      this.console(`index of id [${data.id}] not found in data "${this.tableName}" `, 'danger')
      return false
    }

  }

  truncate () {
    return this.DB.remove(this.tableName)
  }

  delete (id) {
    var db = this.fetch(this.tableName, [])
    const index = db.findIndex(item => item.id === id);
    if (index >= 0) {
      // commiting
      const newArr = db.slice(0, index).concat(db.slice(index + 1));
      this.DB.save(this.tableName, newArr)
      this.console(`Succes updating [${this.tableName}]`, 'success')
    } else {
      this.console(`index of id [${id}] not found in data "${this.tableName}" `, 'danger')
      return false
    }
  }

}

