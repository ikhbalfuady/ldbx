/* LDBX Version 1.0.1
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

  _formater (val) {
    var data = val
    if (!data) {
      console.warn('failed extract data', data)
      return null
    }

    var expl = data.split("|")
    if (expl.length == 2) {
      var format = expl[0]
      var value = expl[1]
      if (format == 'obj') value = JSON.parse(value)
      if (format == 'num') value = parseFloat(value)
      if (format == 'bol') {
        if (value == 'true') value = true
        else value = false
      }
      return value
    } 
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
    this.showLog = showLog
    this.tableName = tableName
    this.whereCondition = []
    this.orderCondition = []
    this.DB = new DB()
  }

  UUID(separator = '') {
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

  /* criteria <array:object> : [
      {
        key: 'keyName',
        operator: '=', // =, >, >=, <, <=, like
        value: 'value',
      }
    ]
  */
  _get (tableName, criteria = null) {
    const start = performance.now()
    var table = this.DB.get(tableName)
    var data = null
    if (table) {
      if (criteria) data = this.query(table, criteria)
      else data = table
    }

    if (this.orderCondition.length) {
      for (let order of this.orderCondition) {
        data = data.sort(this.compareValues(order.key, order.type))
      }
    }

    const end = performance.now()
    this.console(`Query '${tableName}' Execution time: ${end - start} ms`, 'info')
    return data
  }

  operator(operator, value, valueComparartion) {
    value = value ? value : ''
    var res = false
    if (operator === '=' && value === valueComparartion) res = true
    if (operator === '>' && value > valueComparartion) res = true
    if (operator === '>=' && value >= valueComparartion) res = true
    if (operator === '<' && value < valueComparartion) res = true
    if (operator === '<=' && value <= valueComparartion) res = true
    if (operator === 'like' && value.includes(valueComparartion)) res = true
    return res
  }

  query (data, criteria = null) {
    
    var countWhere = criteria ? criteria.length : 0
    if (countWhere === 0) return data
    var res = []
    var totalChecked = 0
    for (let val of data) {
      totalChecked = totalChecked + 1
      var match = 0

      for (let where of criteria) {
        var colVal = val[where.key]
        if (this.operator(where.operator, colVal, where.value)) match = match + 1
      }

      if (match === countWhere) res.push(val)
      
    }
    this.queryLog(data, totalChecked)
    return res
  }

  queryLog(data, totalChecked) {    
    console.info(`querying ${totalChecked} of ${data.length} data`)
  }

  compareValues(key, order = 'asc') {
    return function(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;
      const aValue = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
      const bValue = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
      return aValue > bValue ? (order === 'asc' ? 1 : -1) : aValue < bValue ? (order === 'asc' ? -1 : 1) : 0;
    };
  }

  orderBy(key, type = 'asc') {
    this.orderCondition.push({ key: key, type: type})
    return this
  }

  where (col, oprOrVal, value) {
    var criteria = {
      key: col,
      operator: value ? oprOrVal : '=',
      value: value ? value : oprOrVal,
    }
    this.whereCondition.push(criteria)
    return this
  }

  get() {
    var data = this._get(this.tableName, this.whereCondition)
    return data
  }

  first() {
    var data = this._get(this.tableName, this.whereCondition)
    return data.length ? data[0] : null 
  }

  find (id) {
    return this.where('id', id).first()
  }

  fixStructure(structure) {
    const data = this._get(this.tableName) || [];
    const hasId = structure.includes('id');
    if (!hasId) structure.push('id');
  
    return data.map(row => {
      const fixRow = {};
      structure.forEach(col => {
        fixRow[col] = row[col] || null;
      });
      return fixRow;
    });
  }

  // commiting
  save (data) {
    const id = this.UUID()
    const table = this.DB.get(this.tableName)
    const db = table ? [...table, { ...data, id }] : [{ ...data, id }] // merging 
    this.DB.save(this.tableName, db) // commiting
    this.console(`Success saving [${this.tableName}]`, 'success')
    return { ...data, id }
  }

  update (data) {
    var db = this._get(this.tableName, [])
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
    var db = this._get(this.tableName, [])
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

