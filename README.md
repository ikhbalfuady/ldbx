![logo]( https://ldbx.sopeus.com/logo.png)

# LDBX
Javascript Library for data management using localStorage with laravel eloquent syntax,
Create, Read, Update, Delete and Truncate has avail in this lib.

Demo : [LDXB Demo](https://ldbx.sopeus.com)

# Usage

**Get All Data**

```
const UserModel = new Model('users')
var list = UserModel.get()

```
___


**Get first / single data**

```
const UserModel = new Model('users')
var data = UserModel.where('id', id).first()

```
___

**Single selection where**

```
const UserModel = new Model('users')
var data = UserModel.where('name', 'ikhbalfuady').get()

```
___

**Multiple selection where**

```
// using custom operator
const UserModel = new Model('users')
var data = UserModel.where('age', '>=' 18)
           .where('age', '<=', 25)
           .get()

```
___

**Find by id**

```
const UserModel = new Model('users')
var data = UserModel.find(id)

```
___


**Store Data**

```
const UserModel = new Model('users')
let data = {
  name: "John",
  age: 21
}

UserModel.save(data)

```
___

**Update Data**

```
const UserModel = new Model('users')
let data = UserModel.find(id)
if (!data) throw error(`user with id"${id}" not found `)

// set value into object
data.name = "Ikhbalfuady"
UserModel.update(data)

```
___

**Delete Data**

```
const UserModel = new Model('users')
UserModel.delete(id)

```


# Avail Operator
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

**orderBy(key, type?)**

this is method chaining to implementing "order data" of result query \
- key : object key
- type : asc / desc (default : asc)

```
.orderBy('key') // order ASC
.orderBy('key', 'desc') // order DESC

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
var UserModel = new Model('users')
.belongsTo('roles', 'role_id', 'role') // simply version
.first()

var UserModel = new Model('users')
.belongsTo('coa', 'coa_revenue_code', 'coa_revenue', 'code') // full version
.get()

```

___

**hasMany(tableName, foreignKey, newObjectName?, targetKey?)**

this is method chaining to implementing relation of some data \
this method will be created new single object for every object result data \

- tableName : name of table
- foreignKey : foreign key object, ex : role_id
- newObjectName : object name for the relation , ex : role
- targetKey : target key object of source data, default is "id"


```
var UserModel = new Model('users')
.hasMany('roles', 'role_id', 'roles') // simply version
.first()

var UserModel = new Model('users')
.hasMany('coa', 'coa_revenue_code', 'coa_revenues', 'code') // full version
.get()

```