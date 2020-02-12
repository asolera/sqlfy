# SQLfy

A simple template engine for generating dynamic SQL files.

SQLfy basically reads a source folder containing SQL template files and convert to plain SQL files.

It allows you to use custom global variables, functions and custom SQL methods.

This was originally created to simplify the generation of plain SQL files used in ETL projects. Sometimes you need to rename a table and, instead of replace it manually in every file, you can just update a global variable.

## Installation / Configuration

SQLfy must be installed globally:

```sh
npm i sqlfy -g
```

A config file `sqlfy.js` is needed to work, and you can initialize it using `sqlfy init`.

The following properties are required:

- *sourceDir*: source directory containing SQL template files;
- *destDir*: directory that will receive converted SQL files;
- *templateExtension*: the extension used by your template files (default ".sql");
- *vars*: your global variables that will be used in templates;
- *methods*: your global methods that will be used in templates.

## Basic Usage

Run the command `sqlfy` at the root of your project (the same folder as `sqlfy.js`) and it will automatically convert all template files defined in config file.

## Variables

Global variables must be set inside "vars" properties of `sqlfy.js`.

You can use them inside templates similar to Javascript template strings, preceding by a "underscore".

sqlfy.js:

```js
module.exports = {
    sourceDir: './src',
    destDir: './dist',
    templateExtension: '.sql',
    vars: {
        sample: 'hello_variable'
    },
    methods: {}
};
```

Template:

```sql
CREATE TABLE ${_.sample} ( 
    id SERIAL NOT NULL, 
    desc VARCHAR(50) NOT NULL 
);
```

Converted SQL:

```sql
CREATE TABLE hello_variable ( 
    id SERIAL NOT NULL, 
    desc VARCHAR(50) NOT NULL 
);
```

## Methods

You can also create methods inside `sqlfy.js` that returns a string to substitute the template.

In that case, you have to use the dollar sign before the method.

sqlfy.js:

```js
module.exports = {
    sourceDir: './src',
    destDir: './dist',
    templateExtension: '.sql',
    vars: {},
    methods: {
        sample: () => 'hello_method'
    }
};
```

Template:

```sql
CREATE TABLE ${$.sample()} ( 
    id SERIAL NOT NULL, 
    desc VARCHAR(50) NOT NULL 
);
```

Converted SQL:

```sql
CREATE TABLE hello_method ( 
    id SERIAL NOT NULL, 
    desc VARCHAR(50) NOT NULL 
);
```

## SQL Methods

There are some native SQL methods that you can use to simplify some commands. All these methods must be called preceding by "sql.".

Available methods:
- dropTable(_tableName_) => `DROP TABLE tableName`
- dropView(_viewName_) => `DROP VIEW viewName`
- dropProcedure(_procedureName_) => `DROP PROCEDURE procedureName`
- truncate(_tableName_) => `TRUNCATE TABLE tableName`

You can pass in plain strings, variables or methods defined in config file.

You can algo pass an array instead of table name. In that case, SQLfy will generate a list of statements for each item in array.

Example:

Template:

```sql
-- Example using static string
${sql.dropTable('example_table')}

-- Example using variable
${sql.dropTable(_.sample)}

-- Example using method
${sql.dropTable($.sample())}

-- Example using array
${sql.dropTable(['table_a', 'table_b', 'table_c'])}
```

Will be converted to:

```sql
-- Example using static string
DROP TABLE example_table;

-- Example using variable
DROP TABLE hello_variable;

-- Example using method
DROP TABLE hello_method;

-- Example using array
DROP TABLE table_a;
DROP TABLE table_b;
DROP TABLE table_c;
```

## Author

- [Andrew Solera](https://github.com/asolera/) (andrewsolera@gmail.com)