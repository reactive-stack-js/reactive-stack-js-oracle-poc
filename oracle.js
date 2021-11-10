const oracledb = require('oracledb');
oracledb.events = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const connectionConfig = {
	user: "root",
	password: 'root',
	connectString: "localhost:1521/ORCLCDB.localdomain",
	events: true
};

function myCallback(message) {
	console.log('message', message);
	console.log('txId', JSON.stringify(message?.txId));
	console.log('txId', message.txId.toString('utf8'));
	console.log('message', JSON.stringify(message));
}

const program = async () => {
	console.log("Connecting...");
	let connection = await oracledb.getConnection(connectionConfig);
	console.log("Connected to oracle.");

	console.log("Creating CQN subscription...");
	await connection.subscribe('locks', {
		callback: myCallback,
		qos: 4,
		sql: `SELECT * FROM GLOB_LOCKS`
	});
	console.log("CQN subscription created.");
}
program()
	.then(() => console.log('Waiting for oracle database events...'))
	.catch(console.error);

//
// Test query:
async function getData() {
	let sql = `SELECT * FROM GLOB_LOCKS`;

	let conn = await oracledb.getConnection(connectionConfig);
	let result = await conn.execute(sql);
	await conn.close();
	console.log(result.rows);
	return result.rows;
}

getData();
