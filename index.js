var fs			= require('fs'),
	async		= require('async'),
	pg			= require('pg'),
	testSpecs	= require('./tests'),
	chalk		= require('chalk'),
	client		= new pg.Client();

async.seq(
	getSampleData,
	bootstrapTestTable,
	getTests,
	runTests
)(
	function(error) {
		if (error) {
			throw(error);
		}
	}
);


function getSampleData(callback) {
	async.parallel({
		tableSetup	: fs.readFile.bind(fs , './sql-setup/recreate-table.sql',    'utf-8'), 
		insertData	: fs.readFile.bind(fs , './sql-setup/sample-data.sql',       'utf-8')
	}, (err, files) => {
		if (err) callback(err);

		callback(null, files);
	});
}

function bootstrapTestTable(files, callback) {
	 client.connect((err) => {
		if (err) callback(err);

		async.series({
			execTableSetup	: client.query.bind(client, files.tableSetup), 
			execInsertData	: client.query.bind(client, files.insertData)
		}, (err, opResults) => {
			if (err) callback(err);

			callback(null);
		});
	});
}

function getTests(callback) {
	var readTasks = {};

	Object.keys(testSpecs).forEach((testSpecName) => {
		readTasks[testSpecName] = fs.readFile.bind(fs , testSpecs[testSpecName].testQueryFile, 'utf-8');
	});

	async.parallel(readTasks, (err, files) => {
		if (err) callback(err);

		callback(null, files);
	});
}

function runTests(testQueries, callback) {
	var tests	= [],
		nTests	= 0,
		nFailed	= 0;

	Object.keys(testQueries).forEach((testQueryName) => {
		var runAndAssert = async.seq(
			(callback) => {
				client.query(testQueries[testQueryName], (err, result) => {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			(resultSet, callback) => {
				console.log('Testing: ' + testQueryName);
				
				var passed = testSpecs[testQueryName].testAssertion(resultSet);
				
				nTests++;
				
				if (passed) {
					console.log(chalk.green('Test OK.\n'));
				} else {
					console.error(chalk.red('Test failed.\n'));
					nFailed++;
				}
				callback();
			});

		tests.push(runAndAssert);
	});

	async.series(tests, (err, result) => {
		if (err)
			console.log(err)
			process.exit(1)
		console.log(!nFailed ? 
				chalk.green('All tests OK. Exiting.') :
				chalk.red(`Failed ${ nFailed } test(s).`)
			);
		process.exit(0);
	});
}