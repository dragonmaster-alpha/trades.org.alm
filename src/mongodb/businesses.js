const axios = require('axios');
const { getTokensFromDB, storeTokensInDB } = require('./tokens');

const APP_ID = 'tradesorgbusinesses-dhvmi';
const API_KEY = process.env.MONGODB_API_KEY;
const GRAPHQL_URL = `https://us-east-1.aws.realm.mongodb.com/api/client/v2.0/app/${APP_ID}/graphql`;

let tokens = {};

axios.interceptors.response.use(
    response => response,
    error => {
        const status = error.response ? error.response.status : null;
        if (status === 401) {
            if (tokens.refreshToken) {
                return refreshAccessToken(tokens.refreshToken).then(() => {
                    error.config.headers['Authorization'] = 'Bearer ' + tokens.accessToken;
                    error.config.baseURL = undefined;
                    return axios.request(error.config);
                });
            } else {
                return login().then(() => {
                    error.config.headers['Authorization'] = 'Bearer ' + tokens.accessToken;
                    error.config.baseURL = undefined;
                    return axios.request(error.config);
                });
            }
        } else {
            return Promise.reject(error);
        }
    });

async function login() {
    const response = await axios.post(
        `https://us-east-1.aws.realm.mongodb.com/api/client/v2.0/app/${APP_ID}/auth/providers/api-key/login`,
        {
            key: API_KEY
        }
    );

    tokens.accessToken = response.data.access_token;
    tokens.refreshToken = response.data.refresh_token;
    await storeTokensInDB(tokens);
}

async function refreshAccessToken(refreshToken) {
    const response = await axios.post(
        `https://realm.mongodb.com/api/client/v2.0/auth/session`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        }
    );

    tokens.accessToken = response.data.access_token;
    await storeTokensInDB(tokens);
}

async function getBusinessByPhone(phone) {
    tokens = await getTokensFromDB();

    const query =
        `query { business (query: {phone: "${phone}"}) {
           _id
           name
           phone
           website
           website_host
           categories
           location {
             city
             state
             zip
           }
           mappings {
             hubspot {
               companyId
               dealId
           } } } }`;

    const response = await axios.post(
        GRAPHQL_URL,
        {
            query: query,
        },
        {
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            }
        }
    );

    return response.data.data.business;
}

async function getBusinessById(id) {
    tokens = await getTokensFromDB();

    const query =
        `query { business (query: {_id: "${id}"}) {
           _id
           name
           phone
           website
           website_host
           categories
           location {
             city
             state
             zip
           }
           mappings {
             hubspot {
               companyId
               dealId
           } } } }`;

    const response = await axios.post(
        GRAPHQL_URL,
        {
            query: query,
        },
        {
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            }
        }
    );

    return response.data.data.business;
}

module.exports = {
    getBusinessByPhone,
    getBusinessById
}
