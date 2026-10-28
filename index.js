require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Set up Pug (templating engine)
app.set('view engine', 'pug');
app.set('views', './views');

// Allow the server to serve static files (CSS)
app.use(express.static('public'));

// To allow the form to send data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Our token from the .env file
const TOKEN = process.env.HUBSPOT_TOKEN;
// API URL for the custom object "Plants" (using EU1 domain!)
const API_URL = 'https://api-eu1.hubapi.com/crm/v3/objects/2-255566817';

// 1. Homepage (get the list of plants)
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}?properties=name,species,sunlight`, {
            headers: { Authorization: `Bearer ${TOKEN}` },
            timeout: 5000 // Wait max 5 seconds for HubSpot to respond
        });
        res.render('homepage', { 
            title: 'Plants List', 
            plants: response.data.results 
        });
    } catch (error) {
        console.error('!!! ERROR FETCHING DATA FROM HUBSPOT !!!:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
        res.send('Error loading data from HubSpot');
    }
});

// 2. Form page
app.get('/update-cobj', (req, res) => {
    res.render('updates', { 
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' 
    });
});

// 3. Handle form submission (create a new plant record)
app.post('/update-cobj', async (req, res) => {
    try {
        const newPlant = {
            properties: {
                name: req.body.name,
                species: req.body.species,
                sunlight: req.body.sunlight
            }
        };

        await axios.post(API_URL, newPlant, {
            headers: { 
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.redirect('/');
    } catch (error) {
        console.error('Error creating record:', error.response ? error.response.data : error.message);
        res.send('Error creating record in HubSpot');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running! Open in browser: http://localhost:${PORT}`);
});