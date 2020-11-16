const oracledb = require('oracledb');
oracledb.events = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const connectionConfig = {
	user: "root",
	password: 'root',
	connectString: "localhost:1521/ORCLCDB.localdomain",
	events: true
};

const getData = async () => {
	let sql = `SELECT * FROM GLOB_LOCKS`;

	let conn = await oracledb.getConnection(connectionConfig);
	let result = await conn.execute(sql);
	await conn.close();
	console.log(result.rows);
	return result.rows;
}
getData();

function myCallback(message) {
	console.log('message', message);
	// let rows = await getData();							// query the msgtable
	// console.log('message', JSON.stringify(rows));		// update the web page
}

const program = async () => {
	let connection = await oracledb.getConnection(connectionConfig);

	await connection.subscribe('locks', {
		callback: myCallback,
		sql: `SELECT * FROM GLOB_LOCKS`
	});
	console.log("CQN subscription created");
}
program()
	.then(() => console.log('Waiting for oracle database events...'))
	.catch(console.error);
