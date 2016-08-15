var fs          = require('fs'),
    async       = require('async'),
    pg          = require('pg'),
    testSpecs   = require('./tests'),
    client      = new pg.Client();

async.seq(
    getSampleData,
    bootstrapTestTable,
    getTests,
    runTests
)();


function getSampleData(callback) {
    async.parallel({
        tableSetup  : fs.readFile.bind(fs , './sql-setup/recreate-table.sql',    'utf-8'), 
        insertData  : fs.readFile.bind(fs , './sql-setup/sample-data.sql',       'utf-8')
    }, (err, files) => {
        if (err) callback(err);

        callback(null, files);
    });
}

function bootstrapTestTable(files, callback) {
     client.connect((err) => {
        if (err) callback(err);

        async.series({
            execTableSetup  : client.query.bind(client, files.tableSetup), 
            execInsertData  : client.query.bind(client, files.insertData)
        }, (err, opResults) => {
            if (err) callback(err);

            callback(null);
        });
    });
}

function getTests(callback) {
    var readTasks = {};

    Object.keys(testSpecs).forEach((testSpecName) => {
        readTasks[testSpecName] = fs.readFile.bind(fs , testSpecs[testSpecName].testQueryFile, 'utf-8')
    });

    async.parallel(readTasks, (err, files) => {
        if (err) callback(err);

        callback(null, files);
    });
}

function runTests(testQueries, callback) {
    var tests = [];

    Object.keys(testQueries).forEach((testQueryName) => {
        var runAndAssert = async.seq(
            (callback) => {
                client.query(testQueries[testQueryName], (err, result) => {
                    if (err) callback(err);

                    callback(null, result);
                });
            },
            (resultSet, callback) => {
                console.log('Testing: ' + testQueryName);
                testSpecs[testQueryName].testAssertion(resultSet);
                console.log('Test OK.\n');
                callback();
            });

        tests.push(runAndAssert);
    });

    async.series(tests, (err, result) => {
        console.log('All tests OK. Exiting.');
        process.exit(0);
    });
}