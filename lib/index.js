const fs = require('fs-extra');
const path = require('path');
const colors = require('colors');
const program = require('commander');

const CURRENT_WORKDIR = process.cwd();
const SQLFY_CONFIG_FILE = 'sqlfy.js';
const SQLFY_CONFIG_PATHFILE = path.join(CURRENT_WORKDIR, SQLFY_CONFIG_FILE);

const run = () => {

    program
        .command('init')
        .description('initialize the default SQLfy config file')
        .action((source, destination) => init());

    program
        .command('start')
        .description('start SQLfy builder')
        .action((source, destination) => start());

    program.parse(process.argv);

    if (process.argv.length < 3) start();

    if (program.args.length > 0) {
        console.error(`SQLfy - ERROR: Invalid argument!`.red)
        process.exit(1);
    }


};

const init = () => {
    console.log('Creating default SQLfy config file...'.cyan);
    if (configExists()) {
        console.error(`SQLfy - ERROR: config file already exists!`.red) 
        process.exit(1);
    } 
    try {
        const configData = `module.exports = {
    sourceDir: './src',
    destDir: './dist',
    templateExtension: '.sql',
    vars: {
        sample: 'hello_variable'
    },
    methods: {
        sample: () => 'hello_method'
    }
};`;
        fs.writeFileSync(SQLFY_CONFIG_PATHFILE, configData);
        console.log('SQLfy config file successfully created!'.green);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

const start = () => {
    console.log('Starting SQLfy...'.cyan);
    if (!configExists()) {
        console.error(`SQLfy - ERROR: config file not found! You can create it by using "sqlfy init" command.`.red)
        process.exit(1);
    }

    const config = require(SQLFY_CONFIG_PATHFILE);

    if (!configValid(config)) {
        console.error(`SQLfy - ERROR: config file is missing required properties!`.red)
        process.exit(1);
    }

    const sqlFileList = getSqlFileList(config.sourceDir, config.templateExtension);

    if (sqlFileList < 1) {
        console.log('SQLfy couldn\'t find any file to convert!'.red);
        process.exit(1);
    }

    sqlFileList.map(filePath => convert(filePath, config));
}

const configExists = () => {
    try {
        if(fs.existsSync(SQLFY_CONFIG_PATHFILE)) return true;
        return false;
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

const configValid = config => {
    if (config.sourceDir && config.destDir && config.templateExtension) return true;
    return false;
}

const getSqlFileList = (dir, templateExtension) => {
    let foundFiles = [];
    try {
        let files = fs.readdirSync(dir);
        let numFiles = files.length;

        for (let i = 0; i < numFiles; i++) {
            let file = files[i];
            let filePath = `${dir}/${file}`;
            let stat = fs.statSync(filePath);
            if (stat.isDirectory()) foundFiles = foundFiles.concat(getSqlFileList(filePath, templateExtension));
            if (path.extname(filePath) == templateExtension) foundFiles.push(filePath);
        }
        return foundFiles;
    } catch(err) {
        console.error(`${err.message}`.red);
        process.exit(1);
    }
};

const save = (data, filePath, destDir) => {
    let parse = path.parse(filePath);
    let pathArr = parse.dir.split('/');
    pathArr[1] = path.parse(destDir).base;
    destPathFile = pathArr.join('/');
    let destFilePath = path.join(destPathFile, parse.name + '.sql');
    fs.outputFile(destFilePath, data, (err) => {
        if (err) {
            console.error(`${error.message}`.red);
            process.exit(1);
        }

        console.log(`[${filePath}] SQLified successfully!`.green);
    }); 
}

const convert = (filePath, config) => {
    console.log(`[${filePath}] Converting...`);
    fs.readFile(filePath, 'utf8', (error, data) => {
        if (error) {
            console.error(`${error.message}`.red);
            process.exit(1);
        }

        const _ = config.vars;
        const $ = config.methods;
        const sql = getSQLMethods();

        data = eval('`'+data+'`');
        save(data, filePath, config.destDir);
    });
}

const getSQLMethods = () => {
    const arrayToList = (array, fn) => array.map(fn).join("\n");
    const handleInputValues = (inputValue, stmtFunction) => typeof inputValue === 'string' ? stmtFunction(inputValue) : arrayToList(inputValue, stmtFunction);
    
    const getDropTableStatement = tableName => `DROP TABLE \`${tableName}\`;`;
    const getDropViewStatement = viewName => `DROP VIEW \`${viewName}\`;`;
    const getDropProcedureStatement = procedureName => `DROP PROCEDURE \`${procedureName}\`;`;
    const getTruncateStatement = tableName => `TRUNCATE TABLE \`${tableName}\`;`;

    const dropTable = inputValue => handleInputValues(inputValue, getDropTableStatement);
    const dropView = inputValue => handleInputValues(inputValue, getDropViewStatement);
    const dropProcedure = inputValue => handleInputValues(inputValue, getDropProcedureStatement);
    const truncate = inputValue => handleInputValues(inputValue, getTruncateStatement);

    return {
        dropTable,
        dropView,
        dropProcedure,
        truncate
    };
}

exports.run = run;