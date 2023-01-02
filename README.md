![logo]( https://ldbx.sopeus.com/logo.png)

# LDBX
Javascript Library for data management using localStorage with laravel eloquent syntax,
Create, Read, Update, Delete and Truncate has avail in this lib.

Demo : [LDXB Demo](https://ldbx.sopeus.com)

# Usage

**Initialize Table**

There are 3 params in constructor  :
> using params default
1. Table Name [String] (Required)
2. Query Log in console [Boolean] (Optional)
3. Soft Delete [Boolean] (Optional)

> using config params 
you can using object configuration params with structure like this :
```
{
  table: String,
  showLog: Boolean,
  softDelete: Boolean,
}
```

Example instance

```

// Using default params
const DataModel = new LDBX('users', true, false) 


// Using Config params
const config = {
  table: 'users',
  log: true,
  softDelete: false,
}
const DataModel = new LDBX(config)

```
___


**Get All Data**

```
const UserModel = new LDBX('users')
var list = UserModel.get()

```
___


**Get first / single data**

```
const UserModel = new LDBX('users')
var data = UserModel.where('id', id).first() // *first its mean, first of result query

```
___

**Single selection where**

```
const UserModel = new LDBX('users')
var data = UserModel.where('name', 'ikhbalfuady').get()

```
___

**Multiple selection where**

```
// using custom operator
const UserModel = new LDBX('users')
var data = UserModel.where('age', '>=' 18)
           .where('age', '<=', 25)
           .get()

```
___

**Find by id**

```
const UserModel = new LDBX('users')
var data = UserModel.find(id)

```
___


**Store Data**

```
const UserModel = new LDBX('users')
let data = {
  name: "John",
  age: 21
}

UserModel.save(data)

```
___

**Update Data**

```
const UserModel = new LDBX('users')
let data = UserModel.find(id)
if (!data) throw error(`user with id"${id}" not found `)

// set value into object
data.name = "Ikhbalfuady"
UserModel.update(data)

```
___

**Delete Data**

```
const UserModel = new LDBX('users')
UserModel.delete(id) // default soft delete

// permanent delete
const UserModel = new LDBX('users')
UserModel.delete(id, true)

```


# Avail "**Where**" Operator
| Name               | value   | Syntax                                                    | Status      |
|--------------------|---------|-----------------------------------------------------------|-------------|
| Equal              | =       | .where('key', '=', value) OR .where('key', value)         | READY       |
| Like / Contains    | like    | .where('key', 'like', value)                              | READY       |
| Less Than          | <       | .where('key', '<', value)                                 | READY       |
| Less Than Equal    | <=      | .where('key', '<=', value)                                | READY       |
| Greater Than       | >       | .where('key', '>', value)                                 | READY       |
| Greater Than Equal | >=      | .where('key', '>=', value)                                | READY       |
| Is NULL            | N/n     | .where('key', 'N', value) OR .where('key', 'n', value)    | READY       |
| Is NOT NULL        | NN / nn | .where('key', 'NN', value) OR .where('key', 'nn', value)  | READY       |
| IN                 | IN      | .where('key', 'IN', arrayValue)  // arrayValue =  [1,2,3] | READY       |
| NOT IN             | NIN     | .where('key', 'NIN', arrayValue)  // arrayValue =  [1,2,3]| READY       |

___

# Other Features

**trashed()**

this is method chaining to getting only trashed data

```
var UserModel = new LDBX('users')
.trashed()
.get()


```

**withTrashed()**

this is method chaining to getting all with trashed data if you using **softDelete**

```
var UserModel = new LDBX('users')
.withTrashed()
.get()


```

**truncate()**

this is method chaining to clean up data 

```
var UserModel = new LDBX('users')
.truncate()


```

**hasData()**

this is method chaining to checking table has already have data or not

```
var UserModel = new LDBX('users')
.hasData()


```

**getFillableColumn()**

this is method chaining to getting fillable columns of object you set

```
// getting fillable of existing data
var UserModel = new LDBX('users')
var user = UserModel.find(1)
var fillableColumns = UserModel.getFillableColumn(user)

```

**fixStructure()**

this is method chaining to fixing structure like ALTER TABLE in SQL\
when you chaning structure of object model you have, you just call this method for fix that
example :

```
// current model
let UsersSpec = {
  dbConfig: {
    table: 'users',
    showLog: true,
    softDelete: true,
  },
  dataModel: {
    id: null,
    name: null,
    email: null
  }
}
const UserModel = new LDBX(UsersSpec.dbConfig)
const fillableColumns = UserModel.getFillableColumn(UsersSpec.dataModel)
/* return 
['id', 'name', 'email']
*/

// and you want to change the users to model to like this
let UsersSpec = {
  dbConfig: {
    table: 'users',
    showLog: true,
    softDelete: true,
  },
  dataModel: {
    id: null,
    name: null,
    email: null,
    phone: null, // new
    born_date: null, // new
  }
}

// just do like this
const UserModel = new LDBX(UsersSpec.dbConfig)
const newFillableColumns = UserModel.getFillableColumn(UsersSpec.dataModel)
UserModel.fixStructure(newFillableColumns) // all of data will be updated with new fillable structure

```


**orderBy(key, type?, dateFormat?)**

this is method chaining to implementing "order data" of result query \
- key : String // object key
- type : Enum(asc,desc) (default : asc)
- dateFormat : Boolean (default : false) // for sorting date type data

```
const UserModel = new LDBX('jorunal')
.orderBy('key') // order ASC
.get()

const UserModel = new LDBX('jorunal')
.orderBy('key', 'desc') // order DESC
.get()

// ordering date data
const UserModel = new LDBX('transaction')
.orderBy('date', 'desc', true) // fot better result activate date format with set 3 in third parameter
.get()


```

* Atenttion : order can only be executed once per query, even if you add multiple 'orderBy', the last 'orderBy' is recognized

___

**belongsTo(tableName, foreignKey, newObjectName?, targetKey?)**

this is method chaining to implementing relation of some data \
this method will be created new single object for every object result data \

- tableName : name of table
- foreignKey : foreign key object, ex : role_id
- newObjectName : object name for the relation , ex : role
- targetKey : target key object of source data, default is "id"


```
const UserModel = new LDBX('users')
.belongsTo('roles', 'role_id', 'role') // simply version
.first()

/* return 
{
  id: 1
  name: 'John',
  role_id: 1,
  roles: {
    id: 1,
    name: 'Admin',
  },
}
*/

const UserModel = new LDBX('jorunal')
.belongsTo('coa', 'coa_revenue_code', 'coa_revenue', 'code') // full version
.get()

/* return 
[
  {
    id: 1
    name: 'TRX Forex',
    coa_revenue_code: '101020230'
    coa_revenue: {
      code: '101020230',
      name: 'Fix Revenue',
    }
  },
  {
    id: 2
    name: 'TRX others',
    coa_revenue_code: '4305353353'
    coa_revenue: {
      code: '4305353353',
      name: 'Other Revenue',
    }
  }
]
*/

```

___

**hasMany(tableName, foreignKey, newObjectName?, targetKey?)**

this is method chaining to implementing relation of some data\
this method will be created new single object with array result for every object in result data\

- tableName : name of table
- foreignKey : foreign key object, ex : role_id
- newObjectName : object name for the relation , ex : role
- targetKey : target key object of source data, default is "id"


```
const UserModel = new LDBX('users')
.hasMany('roles', 'role_id', 'roles') // simply version
.first()
/* return 
{
  id: 1
  name: 'John',
  roles: [
    {
      id: 1,
      name: 'Admin',
    },
    {
      id: 2,
      name: 'Staff',
    }
  ],
}
*/

const UserModel = new LDBX('jorunal')
.hasMany('coa', 'coa_revenue_code', 'coa_revenues', 'code') // full version
.get()

/* return 
[
  {
    id: 1
    name: 'transaction',
    coa_revenues: [
      {
        code: '101020230',
        name: 'Fix Reveneu',
      },
      {
         code: '105020230',
        name: 'Other Revenue
    ],
  }
]
*/

```