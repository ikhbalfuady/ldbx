/* LDBX Version 1.2.5
Author : ikhbalfuady@gmail.com
This some utilities script to help you manage localStorage data
the style syntax similary like laravel eloquent to help you easy to understod the query
avail to save, update, delete, get all & get single 
*/

/* LocalStorage Helper */
class DB {
  constructor() {
    this.key = null
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
      console.warn(`Failed to extract data [${this.key}]`, val)
      return null
    }
  
    const [format, value] = val.split("|")
    if (format === 'obj') return JSON.parse(value)
    if (format === 'num') return parseFloat(value)
    if (format === 'bol') return value === 'true'
    return value
  }

  save (key, value) {
    this.key = key
    localStorage.setItem(key, this.setter(value))
  }

  get (key) {
    this.key = key
    var val = localStorage.getItem(key)
    val = this.formater(val)
    return val
  }

  remove (key) {
    this.key = key
    return localStorage.removeItem(key)
  }
}

/* Eloquent */
class LDBX {
  constructor(tableOrConfig = null, showLog = true, softDelete = true) {
    if (typeof(tableOrConfig) === 'object') {
      if (tableOrConfig.table) this.tableName = tableOrConfig.table
      else this.console("Table name not defined, plese make object with name 'table' if you using object config params!")

      if (tableOrConfig.softDelete) this.softDelete = tableOrConfig.softDelete
      if (tableOrConfig.showLog) this.showLog = tableOrConfig.showLog
    }
    this.tableName = tableOrConfig // localstorage key name
    this.showLog = showLog // log performance
    this.softDelete = softDelete // softDelete
    this.onlyData = softDelete ? 'active' : 'all' // data filtering : active,trash,all

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
        key         : String,
        type        : Enum('asc','desc),
        dateFormat  : Boolean,
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

  getFillableColumn (obj) {
    var res = []
    for (k in obj) { res.push(k) } 
    return res
  }

  resetProps () {
    this.whereCondition = []
    this.orderCondition = []
    this.belongsToRelation = []
    this.hasManyRelation = []
    this.onlyData = this.softDelete ? 'active' : 'all'
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
    ].join('') // 2. Concatenate the individual array item and concatenate them into a string separated by a semi-colon ()

    // 3. Pass the styles variable
    var csl = '%c'+ '[LDBX]⇒ ' +msg
    if (this.showLog) {
      if (type === 'info') console.info(csl, styles)
      else if (type === 'warning') console.warn(csl, styles)
      else if (type === 'danger') console.error(csl, styles)
      else console.debug(csl, styles)
    }
  }

  dateNow () {
    const date = new Date();
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);  // Add 1 to the month because it is 0-based, and pad with a leading 0 if necessary
    const day = `0${date.getDate()}`.slice(-2);  // Pad with a leading 0 if necessary
    const hour = `0${date.getHours()}`.slice(-2);  // Pad with a leading 0 if necessary
    const minute = `0${date.getMinutes()}`.slice(-2);  // Pad with a leading 0 if necessary
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  hasData () {
    var table = this.DB.get(this.tableName)
    if (table && table.length) {
      this.console(`[hasData] ${this.tableName} : true`, 'info')
      return true
    } else {
      this.console(`[hasData] ${this.tableName} : false`, 'info')
      return false
    }
  }

  /* 
    fillableColumns : ['id', 'name', 'code']
  */
  fixStructure (fillableColumns) {
    var data = this.fetch(this.tableName) || []
    const hasId = fillableColumns.includes('id')
    if (!hasId) fillableColumns.push('id')
  
    data = data.map(row => {
      const fixRow = {}
      fillableColumns.forEach(col => {
        fixRow[col] = row[col] || null
      })
      return fixRow
    })

    this.DB.save(this.tableName, data) // commiting
    console.info(`Success updating structure [${this.tableName}]`, fillableColumns, data)
  }

  /* criteria = whereCondition */
  fetch (tableName, criteria = [], tag = '') {
    const start = performance.now()
    var table = this.DB.get(tableName) || []
    var data = []
    if (table) {
      if (criteria.length) data = this.query(table, criteria)
      else data = this.handleSoftDeleteData(table)
    }

    if (this.orderCondition.length) {
      for (let order of this.orderCondition) {
        if (order.dateFormat) data = this.sortByDateFormat(data, order.key, order.type)
        else data = this.sortBy(data, order.key, order.type)
      }
    }

    const end = performance.now()
    this.console(`${tag} Query ${data.length} of '${tableName}' Execution time: ${end - start} ms`, 'info')
    return data
  }

  sortBy(data, key, order = 'asc') {
    return data.sort((a, b) => {
      const aValue = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key]
      const bValue = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key]
      return aValue > bValue ? (order === 'asc' ? 1 : -1) : aValue < bValue ? (order === 'asc' ? -1 : 1) : 0
    })
  }

  sortByDateFormat(data, key, order = 'asc') {
    return data.sort((a, b) => {
      const aValue = new Date(a[key]);
      const bValue = new Date(b[key]);
      if (order === 'asc') return aValue - bValue;
      else return bValue - aValue;
    })
  }

  handleSoftDeleteObj (obj) {
    let res = false
    if (this.softDelete) {
      if (this.onlyData === 'active' && !obj.deleted_at) res = true
      else if (this.onlyData === 'trash' && obj.deleted_at) res = true
      else if (this.onlyData === 'all' && obj.deleted_at) res = true
    } else res = true
    return res
  }

  handleSoftDeleteData (data) {
    var res = []
    for  (let i = 0; i < data.length; i++) {
      if (data[i] && this.handleSoftDeleteObj(data[i])) res.push(data[i])
    }
    return res
  }

  compareValues (key, order = 'asc') {
    return function(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0
      const aValue = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key]
      const bValue = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key]
      return aValue > bValue ? (order === 'asc' ? 1 : -1) : aValue < bValue ? (order === 'asc' ? -1 : 1) : 0
    }
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
    console.log('asd', this.tableName, this.onlyData)
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
      if (match === countWhere) {
        // if (this.softDelete) {
        //   if (this.onlyData === 'active' && !val.deleted_at) res.push(val)
        //   else if (this.onlyData === 'trash' && val.deleted_at) res.push(val)
        //   else if (this.onlyData === 'all' && val.deleted_at) res.push(val)
        // } else res.push(val)
        if (this.handleSoftDeleteObj(val)) res.push(val)
      }
    }
    // console.info(`querying ${totalChecked} of ${data.length} data`)
    return res
  }

  // Chain
  trashed() {
    this.onlyData = 'trash'
    return this
  }

  withTrashed() {
    this.onlyData = 'all'
    return this
  }

  orderBy (key, type = 'asc', dateFormat = false) {
    this.orderCondition.push({ key: key, type: type, dateFormat})
    return this
  }

  where (col, oprOrVal, value) {
    var criteria = {
      key: col,
      operator: value ? oprOrVal : '=',
      value: value ? value : oprOrVal,
    }

    if (criteria.operator.toLowerCase() === 'n') criteria = { key: col, operator: 'N', value: null}
    if (criteria.operator.toLowerCase() === 'nn') criteria = { key: col, operator: 'NN', value: null}
    if (criteria.operator.toLowerCase() === 'in') criteria = { key: col, operator: 'IN', value: value}
    if (criteria.operator.toLowerCase() === 'nin') criteria = { key: col, operator: 'NIN', value: value}

    this.whereCondition.push(criteria)
    return this
  }

  // Relations
  collectRelation (data) {
    return data.map( obj => {
      if (this.belongsToRelation.length) obj = this.getRelation(obj, 'belongsTo')
      if (this.hasManyRelation.length) obj = this.getRelation(obj, 'hasMany')
      return obj
    })
  }

  getRelation(obj, type = 'belongsTo') {
    var relationMapName = `${type}Relation` 
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

  // Trigger
  get () {
    var data = this.fetch(this.tableName, this.whereCondition)
    console.log('get', this.onlyData, data)
    data = this.collectRelation(data)
    this.resetProps()
    return data
  }

  first () {
    var data = this.fetch(this.tableName, this.whereCondition)
    data = this.collectRelation(data)
    this.resetProps()
    return data.length ? data[0] : null 
  }

  find (id) {
    return this.where('id', id).first()
  }

  // Commiting
  save (data) {
    let id = this.UUID()
    const created_at = this.dateNow()
    const updated_at = this.dateNow()
    const deleted_at = null

    if (data.id) id = data.id
    const table = this.DB.get(this.tableName)
    const db = table ? [...table, { ...data, id, created_at, updated_at, deleted_at }] : [{ ...data, id, created_at, updated_at, deleted_at }] // merging 
    this.DB.save(this.tableName, db) // commiting
    this.console(`Success saving [${this.tableName}]`, 'success')
    this.resetProps()
    return { ...data, id }
  }

  update (data) {
    data.updated_at = this.dateNow()
    var db = this.fetch(this.tableName, [])
    const index = db.findIndex(item => item.id === data.id)
    if (index >= 0) {
      db[index] = data
      // commiting
      this.DB.save(this.tableName, db)
      this.console(`Succes updating [${this.tableName}]`, 'success')
      this.resetProps()
      return data
    } else {
      this.console(`update:: index of id [${data.id}] not found in data "${this.tableName}" `, 'danger')
      return false
    }

  }

  truncate () {
    return this.DB.remove(this.tableName)
  }

  delete (id, force = false) {
    var db = this.fetch(this.tableName, [])
    const index = db.findIndex(item => item.id === id)
    if (index >= 0) {
      // commiting
      if (this.softDelete && force === false) {
        db[index].deleted_at = this.dateNow()
        this.DB.save(this.tableName, db)
      } else {
        const newArr = db.slice(0, index).concat(db.slice(index + 1))
        this.DB.save(this.tableName, newArr)
      }
      this.console(`Succes updating [${this.tableName}]`, 'success')
    } else {
      this.console(`delete: index of id [${id}] not found in data "${this.tableName}" `, 'danger')
      return false
    }
  }


}

