const express = require('express');
const cors = require("cors");
const multer = require('multer');
const upload = multer({ dest: 'dataset/' })
const fs = require('node:fs');

const { pgp, db } = require("./db");

const dotenv = require('dotenv');
const authenticateKey = require("./apiAuth");
dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());



app.post('/addNewData', authenticateKey, upload.single('avatar'), async (req, res) => {

    let data = ''
    try {
        data = fs.readFileSync(req.file.path, 'utf8');
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Internal Server Error' });
        return
    }

    // delete a file asynchronously
    fs.unlink(req.file.path, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('File is deleted.');
        }
    });

    try {
        data = JSON.parse(data)
    } catch (error) {
        console.error('Json parse Error: ', error);
        res.status(400).json({ message: 'Bad Data' });
        return
    }

    try {

        let cs = new pgp.helpers.ColumnSet(['age', 'gender', 'height', 'weight'], { table: 'subject' });
        let query = pgp.helpers.insert(data, cs) + ' RETURNING id';

        let result = await db.one(query);
        console.log('Inserted row', result);
        const subject_id = result.id;

        const walks = data.walks;
        // walks = walks.map(obj => ({ ...obj, subject_id : subject_id, phone_model : "dummy", walk_type : 0 }));
        for (let i = 0; i < walks.length; i++) {
            walks[i].subject_id = subject_id;
        }

        cs = new pgp.helpers.ColumnSet(['track', 'device_position', 'walk_type', 'time', 'phone_model', 'subject_id'], { table: 'walk' });
        query = pgp.helpers.insert(walks, cs) + ' RETURNING id';
        const walk_id = result = await db.many(query);
        console.log('Inserted row', walk_id);

        for (let i = 0; i < walks.length; i++) {
            const mAccl = walks[i].mAccl;
            mAccl.walk_id = walk_id[i].id;

            cs = new pgp.helpers.ColumnSet(['avg_sample_rate', 'avg_delay', 'sensor_model', 'accl_net_avg', 'accl_net_dev',
                'accl_x_avg', 'accl_y_avg', 'accl_z_avg', 'accl_x_dev', 'accl_y_dev', 'accl_z_dev', 'walk_id'], { table: 'accelerometer' });
            query = pgp.helpers.insert(mAccl, cs) + ' RETURNING id';
            result = await db.one(query);
            const mAccl_id = result.id;
            console.log('Inserted row', mAccl_id);

            mAccl_data = mAccl.data
            for (let i = 0; i < mAccl_data.length; i++) {
                mAccl_data[i].accelerometer_id = mAccl_id;
            }

            cs = new pgp.helpers.ColumnSet(['timestamp', 'accl_x', 'accl_y', 'accl_z', 'accelerometer_id'], { table: 'accelerometer_data' });
            query = pgp.helpers.insert(mAccl_data, cs) + ' RETURNING id';
            result = await db.many(query);
            console.log('Inserted row', result);

            const mGyro = walks[i].mGyro;
            mGyro.walk_id = walk_id[i].id;

            cs = new pgp.helpers.ColumnSet(['avg_sample_rate', 'avg_delay', 'sensor_model', 'gyro_net_avg', 'gyro_net_dev',
                'gyro_x_avg', 'gyro_y_avg', 'gyro_z_avg', 'gyro_x_dev', 'gyro_y_dev', 'gyro_z_dev', 'walk_id'], { table: 'gyroscope' });
            query = pgp.helpers.insert(mGyro, cs) + ' RETURNING id';
            result = await db.one(query);
            const mGyro_id = result.id;
            console.log('Inserted row', mGyro_id);

            mGyro_data = mGyro.data
            for (let i = 0; i < mGyro_data.length; i++) {
                mGyro_data[i].gyroscope_id = mGyro_id;
            }

            cs = new pgp.helpers.ColumnSet(['timestamp', 'gyro_x', 'gyro_y', 'gyro_z', 'gyroscope_id'], { table: 'gyroscope_data' });
            query = pgp.helpers.insert(mGyro_data, cs) + ' RETURNING id';
            result = await db.many(query);
            console.log('Inserted row', result);
        }

        res.status(201).json({ message: 'Data inserted successfully' });

    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.get('/test', (req, res) => {
    res.end("hello");
});

app.get('/*', (req, res) => {
    res.status(404).end("Page not found");
});

module.exports = app;

// app.post('/addNewData', async (req, res) => {

//     try {

//         const { age, gender, height, walks, weight } = req.body;


//         let query = `INSERT INTO subject(age,gender,height,weight) VALUES($1,$2,$3,$4) returning id;`;

//         // // Using the pool to execute the query
//         let result = await pool.query(query, [age, gender, height, weight]);
//         const subject_id = result.rows[0].id;

//         console.log('Inserted row', subject_id);

//         // // Log the inserted row

//         for (let i = 0; i < walks.length; i++) {
//             query = `INSERT INTO walk(track,device_position,walk_type,time,phone_model,subject_id) VALUES($1,$2,$3,$4,$5,$6) returning id;`

//             const { device_position, mAccl, mGyro, time, track } = walks[i];
//             result = await pool.query(query, [track, device_position, 0, time, "dummy", subject_id]);
//             const walk_id = result.rows[0].id;

//             // // Log the inserted row
//             console.log('Inserted row', result.rows[0]);

//             query = `INSERT INTO accelerometer(avg_sample_rate,avg_delay,sensor_model,accl_net_avg,accl_net_dev,
//                 accl_x_avg,accl_y_avg,accl_z_avg,accl_x_dev,accl_y_dev,accl_z_dev,walk_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id;`
//             const { data: accl_data } = mAccl;
//             result = await pool.query(query, [0, 0, "dummy", 0, 0, 0, 0, 0, 0, 0, 0, walk_id]);
//             const accl_id = result.rows[0].id;

//             console.log('Inserted row', result.rows[0]);

//             query = `INSERT INTO accelerometer_data(timestamp,accl_x,accl_y,accl_z,accelerometer_id) VALUES($1,$2,$3,$4,$5) returning id;`
//             for (let i = 0; i < accl_data.length; i++) {
//                 const { accl_x, accl_y, accl_z, timestamp } = accl_data[i]
//                 result = await pool.query(query, [timestamp, accl_x, accl_y, accl_z, accl_id]);
//                 console.log('Inserted row', result.rows[0]);
//             }

//             query = `INSERT INTO gyroscope(avg_sample_rate,avg_delay,sensor_model,gyro_net_avg,gyro_net_dev,
//                 gyro_x_avg,gyro_y_avg,gyro_z_avg,gyro_x_dev,gyro_y_dev,gyro_z_dev,walk_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id;`
//             const { data: gyro_data } = mGyro;
//             result = await pool.query(query, [0, 0, "dummy", 0, 0, 0, 0, 0, 0, 0, 0, walk_id]);
//             const gyro_id = result.rows[0].id;

//             console.log('Inserted row', result.rows[0]);

//             query = `INSERT INTO gyroscope_data(timestamp,gyro_x,gyro_y,gyro_z,gyroscope_id) VALUES($1,$2,$3,$4,$5) returning id;`
//             for (let i = 0; i < gyro_data.length; i++) {
//                 const { gyro_x, gyro_y, gyro_z, timestamp } = gyro_data[i];
//                 result = await pool.query(query, [timestamp, gyro_x, gyro_y, gyro_z, gyro_id]);
//                 console.log('Inserted row', result.rows[0]);
//             }


//         }

//         res.status(201).json({ message: 'Data inserted successfully' });
//     } catch (error) {
//         console.error('Error inserting data:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// })