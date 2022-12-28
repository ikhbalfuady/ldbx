## Usages
There are 2 Class functional in this plugin **DB** and **Model**

### #DB
All about localStorage function defined in this instance

---

### #Model
All of functional like eloquent, processing data do it here, before data fetching / commiting into localStorage, data will be prepared in this instance

__

### `UUID(separator?) : string`
function to generate UUID for identifier data , default using for "id" object.

***Parameters***

- `separator`: (optional) A string to use as a separator between the different sections of the UUID. The default value is an empty string.

***Return value***

A string in the format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`, where `x` represents a random hexadecimal digit and `y` represents a random hexadecimal digit in the range `8` to `b`.

__

### `console(msg, type?) : void`
function to make uutputs a styled message to the console.

***Parameters***
- `msg`: The message to be output to the console.
- `type`: (optional) The type of the message. Possible values are `'info'`, `'warning'`, `'success'`, and `'danger'`. The default value is `'info'`.
__

### `_get(tableName, criteria?) : arrayObject`
This function retrieves data from a table in the localStorage based on the specified search criteria. If no search criteria are specified, all rows in the table are returned. The data is sorted according to the `orderCondition` property before it is returned. The function also outputs the execution time of the query to the console.

***Parameters***
- `tableName`: The name of the table to retrieve data from.
- `criteria`: (optional) An array of objects specifying search criteria for the data to be retrieved. Each object in the array should have the following properties:
  - `key`: The name of the column to search.
  - `operator`: The comparison operator to use. Possible values are `'='`, `'>'`, `'>='`, `'<'`, `'<='`, and `'like'`.
  - `value`: The value to compare against.

***Example***

// Retrieve all rows from the 'users' table

`_get('users')`

// Retrieve all rows from the 'users' table where the 'name' column is 'John'

`_get('users', [{key: 'name', operator: '=', value: 'John'}])`

// Retrieve all rows from the 'users' table where the 'age' column is greater than 18

`_get('users', [{key: 'age', operator: '>', value: 18}])`

