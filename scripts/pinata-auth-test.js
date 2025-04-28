const axios = require('axios');
require('dotenv').config();

axios.get('https://api.pinata.cloud/data/testAuthentication', {
  headers: {
    'pinata_api_key': process.env.PINATA_API_KEY,
    'pinata_secret_api_key': process.env.PINATA_API_SECRET,
  }
})
.then(res => console.log("Pinata Auth Success:", res.data))
.catch(err => console.error("Pinata Auth Error:", err.response?.data || err));
