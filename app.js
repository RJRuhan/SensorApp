const express = require('express');
const cors = require("cors");

const pool = require("./db");

const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.post('/addNewData',async(req,res)=>{

    try {
        // const { age, gender, height, weight } = req.body;

        console.log(req.body)

        // Example query: Inserting values into a table
        // const query = `INSERT INTO subject(age,gender,height,weight) VALUES($1,$2,$3,$4) returning id;`;

        // const values = [age, gender, height, weight];

        // // Using the pool to execute the query
        // const result = await pool.query(query, values);

        // // Log the inserted row
        // console.log('Inserted row:', result.rows[0]);

        res.status(201).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.get('/test',(req,res)=>{
    res.end("hello");
});

app.get('/*',(req,res)=>{
    res.status(404).end("Page not found");
});

module.exports = app ;