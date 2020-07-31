/**
 * Leve
 * Created by Eduardo Henrique
 */

const yargs = require('yargs');

const { list, add, edit, remove } = require('./leve');

yargs
    .scriptName('leve')
    .usage('$0 <cmd> [args]')
    .command(
        'add',
        'Add new variable',
        yargs => {
            yargs.positional('name', { type: 'string' });
            yargs.positional('value', { type: 'string' });
        },
        argv => add(argv.name, argv.value)
    )
    .command(
        'edit',
        'Edit a existent variable',
        yargs => {
            yargs.positional('name', { type: 'string' });
            yargs.positional('value', { type: 'string' });
        },
        argv => edit(argv.name, argv.value)
    )
    .command(
        'list',
        'List all variable added',
        yargs => {},
        argv => list()
    )
    .command(
        'remove',
        'Remove a variable',
        yargs => {
            yargs.positional('name', { type: 'string' });
        },
        argv => remove(argv.name)
    )
    .help().argv;
