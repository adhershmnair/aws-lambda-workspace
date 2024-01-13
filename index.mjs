import awsServerlessExpress from 'aws-serverless-express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';

// Function to load environment variables from a file if it exists
const loadEnv = (filePath) => {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    console.log(`Loaded environment variables from ${filePath}`);
  } else {
    console.log(`${filePath} not found. Using .env`);
    dotenv.config(); // Load from .env if .env.local doesn't exist
  }
};

// Try to load .env.local first, then fall back to .env
loadEnv('.env.local');

const app = express();
const port = process.env.PORT || 3000; // Define a default port if not provided
const host = process.env.HOST || 'localhost'; // Define a default host if not provided
app.use(cors());

// Replace with your Redmine API Key and URL
const redmineUrl = 'https://projects.zyxware.net';

app.get('/', async (req, res) => {
    try {
        const redmineid = req.query.redmineid || 466
        const redmineApiKey = req?.query?.accessToken || 'ad948fc07f0ea7e5dfe78f1fc730db0f18d5d2f0'
        const startDate = req.query.from || '2023-09-01'
        const endDate = req.query.to || '2023-09-30'
        const apiUrl = `${redmineUrl}/time_entries.json?user_id=${redmineid}&from=${startDate}&to=${endDate}&limit=100`;
    
        const response = await fetch(apiUrl, {
          headers: {
            'X-Redmine-API-Key': redmineApiKey,
          },
        });
        if (response) {
          const data = await response.json();
          res.json(data);
        } else {
          res.status(response.status).json({ error: 'Failed to fetch data from Redmine API' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/redmine-projects', async (req, res) => {
    try {
        const redmineApiKey = req?.query?.accessToken || 'ad948fc07f0ea7e5dfe78f1fc730db0f18d5d2f0'
        const apiUrl = `${redmineUrl}/projects.json`;
        const response = await fetch(apiUrl, {
          headers: {
            'X-Redmine-API-Key': redmineApiKey,
          },
        });
        if (response) {
          const data = await response.json();
          res.json(data);
        } else {
          res.status(response.status).json({ error: 'Failed to fetch data from Redmine API' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/jira', async (req, res) => {
    try {
        const jiraID = req.query.jiraId || '615292bc289a54006aaf86bc'
        const jiraKey= process.env.VUE_APP_JIRA_KEY
        const jiraEmail= process.env.VUE_APP_JIRA_EMAIL
        await fetch(`https://vu-pmo.atlassian.net/rest/api/3/search?jql=updated >= -5w AND project = CMS AND assignee in (${jiraID}) ORDER BY created DESC`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${jiraEmail}:${jiraKey}`
            ).toString('base64')}`,
            'Accept': 'application/json'
          }
        })
        .then(response => {
            return response.json();
        })
        .then(text => res.json(text))
        .catch(err => console.error(err));
    } catch (error) {
        console.log(error)
    }
});

// Create a server instance and pass the Express app to it
const server = awsServerlessExpress.createServer(app);

// Create the Lambda handler function
export const handler = (event, context) => {
  // Pass the event and context to the server's proxy method
  awsServerlessExpress.proxy(server, event, context);
};
