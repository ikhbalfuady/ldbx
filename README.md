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
| Name               | value   | Syntax                                                   | Status      |
|--------------------|---------|----------------------------------------------------------|-------------|
| Equal              | =       | .where('key', '=', value) OR .where('key', value)        | READY       |
| Like / Contains    | like    | .where('key', 'like', value)                             | READY       |
| Less Than          | <       | .where('key', '<', value)                                | READY       |
| Less Than Equal    | <=      | .where('key', '<=', value)                               | READY       |
| Greater Than       | >       | .where('key', '>', value)                                | READY       |
| Greater Than Equal | >=      | .where('key', '>=', value)                               | READY       |
| Is NULL            | N/n     | .where('key', 'N', value) OR .where('key', 'n', value)   | COMING SOON |
| Is NOT NULL        | NN / nn | .where('key', 'NN', value) OR .where('key', 'nn', value) | COMING SOON |
| IN                 | IN      | .where('key', 'IN', arrayValue)                          | COMING SOON |
| NOT IN             | NIN     | .where('key', 'NIN', arrayValue)                         | COMING SOON |
