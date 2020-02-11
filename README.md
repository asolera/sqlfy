# sqlfy

A simple template engine for SQL files.

SQLfy basically reads a source folder containing SQL template files and convert to plain SQL files.

It allows you to use global variables and functions.

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

### Conversion

Run the command `sqlfy` at the root of your project (the same folder as `sqlfy.js`).

### Variables

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
    methods: {
        sample: () => 'hello_method'
    }
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

### Methods

You can also create methods inside `sqlfy.js` that returns a string to substitute the template.

In that case, you have to use the dollar sign before the method.

sqlfy.js:

```js
module.exports = {
    sourceDir: './src',
    destDir: './dist',
    templateExtension: '.sql',
    vars: {
        sample: 'hello_variable'
    },
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

## Author

- [Andrew Solera](https://github.com/asolera/) (andrewsolera@gmail.com)