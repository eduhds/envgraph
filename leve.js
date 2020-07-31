const fs = require('fs');

/**
 * Write a file
 * @param {*} path
 * @param {*} content
 */
function writeFile(path, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, 'utf8', err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * List variables
 */
function list() {
    let vars = require('./vars.json');
    vars.forEach(v => console.log(`$${v.name} = ${v.value}`));
}

/**
 * Add new variable
 * @param {*} name
 * @param {*} value
 */
function add(name, value) {
    name = name.toUpperCase();

    let vars = require('./vars.json');

    let exist = vars.find(i => i.name === name);

    if (exist) {
        console.log(`${name} already exist`);
    } else {
        vars = [...vars, { name, value }];

        writeFile('./vars.json', JSON.stringify(vars))
            .then(() => parse(vars))
            .catch(err => console.log('Error:', err));
    }
}

/**
 * Edit a variable
 * @param {*} name
 * @param {*} value
 */
function edit(name, value) {
    name = name.toUpperCase();

    let vars = require('./vars.json');

    let exist = vars.find(i => i.name === name);

    if (!exist) {
        console.log(`${name} does not exist`);
    } else {
        vars.forEach(v => {
            if (v.name === name) {
                v.value = value;
            }
        });

        writeFile('./vars.json', JSON.stringify(vars))
            .then(() => parse(vars))
            .catch(err => console.log('Error:', err));
    }
}

/**
 * Remove a variable
 * @param {*} name
 */
function remove(name) {
    name = name.toUpperCase();

    let vars = require('./vars.json');

    let exist = vars.find(i => i.name === name);

    if (!exist) {
        console.log(`${name} does not exist`);
    } else {
        vars = vars.filter(v => v.name !== name);

        writeFile('./vars.json', JSON.stringify(vars))
            .then(() => parse(vars))
            .catch(err => console.log('Error:', err));
    }
}

/**
 * Parse vars file
 * @param {*} vars
 */
function parse(vars) {
    let content = '# leve vars\n\n';
    let exportLine = '';

    vars.forEach(v => {
        content += `${v.name}=${v.value}\n`;
        exportLine += `:$${v.name}`;
    });

    content += '\n\n';
    content += `export PATH="$PATH${exportLine}"\n\n`;

    writeFile('./vars.leve', content)
        .then(() =>
            console.log(
                'Updated successfully. Restart your system or type:\nsource $HOME/.leve/vars.leve'
            )
        )
        .catch(err => console.log('Error:', err));
}

module.exports = {
    list,
    add,
    edit,
    remove
};
