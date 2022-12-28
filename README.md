# Usage

**Get All Data**

```
const UserModel = new Model('users')
var list = UserModel.get()

```
___

**Get Some Data**

```
const UserModel = new Model('users')
var data = UserModel.where('name', 'ikhbalfuady').get()

// Multiple selection where
var data = UserModel.where('age', '>=' 18)
           .where('age', '<=', 25)
           .get()

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
UserModel.save(data)

```
___

**Delete Data**

```
const UserModel = new Model('users')
UserModel.delete(id)
