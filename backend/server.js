require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
    if (error) { 
        throw error; 
    }
    console.log(`Server is running on port ${PORT}`);
});

console.log('CLIENT_ID:', process.env.GITHUB_CLIENT_ID);
console.log('CALLBACK:', process.env.GITHUB_CALLBACK_URL);
console.log('SECRET length:', process.env.GITHUB_CLIENT_SECRET?.length);