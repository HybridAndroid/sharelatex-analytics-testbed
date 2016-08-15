var assert = require('assert'),
	baseTestQueriesDir = './sql-test-queries/';

module.exports = {
	SimpleSelect: {
		testQueryFile: baseTestQueriesDir + 'simple-select-events.sql',
		testAssertion: (resultSet) => {
			console.log('Expecting 15 "user-logged-in" events. Got ' + resultSet.rowCount + '.');
			assert(resultSet.rowCount === 15);
		}
	},
	SelectDistinctEvents: {
		testQueryFile: baseTestQueriesDir + 'select-distinct-events.sql',
		testAssertion: (resultSet) => {
			console.log('Expecting 14 different events. Got ' + resultSet.rowCount + '.');
			assert(resultSet.rowCount === 14);
		}
	}
}