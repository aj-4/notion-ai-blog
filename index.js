const express = require('express');
const app = express();
const port = 3000;
const { Client } = require("@notionhq/client");
const axios = require('axios');
require('dotenv').config();

const LINKS_DATABASE_ID = process.env.LINKS_DATABASE_ID;
const SOURCES_DATABASE_ID = process.env.SOURCES_DATABASE_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

if (!LINKS_DATABASE_ID || !SOURCES_DATABASE_ID || !NOTION_TOKEN) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1);
}

// Initializing a client
const notion = new Client({
  auth: NOTION_TOKEN,
});

// Middleware to parse incoming JSON requests
app.use(express.json());

app.get('/scrapeNotionLinks', async (req, res) => {
  try {
    // 1. Query the Notion database for unscraped records
    const response = await notion.databases.query({
      database_id: LINKS_DATABASE_ID,
      filter: {
        property: 'Scraped',
        checkbox: {
          does_not_equal: true
        }
      }
    });

    console.log('properties', response.results[0].properties)

    const unscrapedLinks = response.results;
    if (unscrapedLinks.length === 0) {
      res.status(200).send('No unscraped records found');
      return;
    }

    for (const link of unscrapedLinks) {
      const url = link.properties.URL.title[0].plain_text;

      // 2. Call the server at localhost:3001/getData
      const serverResponse = await axios.post('http://127.0.0.1:3001/getData', { url });
      if (serverResponse.status !== 200) {
        console.error(`Error fetching data for ${url}: ${serverResponse.statusText}`);
        continue;
      }

      // 3. Save the response as a new page in the POSTS_DATABASE_ID
      await notion.pages.create({
        parent: {
          database_id: SOURCES_DATABASE_ID
        },
        properties: {
          Name: {
            title: [{ text: { content: serverResponse.data['Submission Title'] } }]
          }
        },
        children: formatBlocks(serverResponse.data, url)
      });

      // 4. Update the original record to mark as scraped
      await notion.pages.update({
        page_id: link.id,
        properties: {
          Scraped: {
            checkbox: true
          }
        }
      });
    }

    res.status(200).send('Database updated successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while processing the request');
  }
});

// Function to format blocks according to the specified structure
function formatBlocks(data, sourceUrl) {
  const blocks = [];

  // Add source URL as a text block
  blocks.push(createTextBlock(`Source: ${sourceUrl}`));

  blocks.push(createDividerBlock());

  // Add Posted By
  blocks.push(createTextBlock(`Posted By: u/${data.Username}`));

  // Add Post content
  blocks.push(createHeadingBlock('Post Content', 2));
  const postContent = data['Submission Text'];
  addContentInChunks(blocks, postContent);

  blocks.push(createDividerBlock());

  // Add Comments section
  blocks.push(createHeadingBlock('Top Comments', 2));

  // Sort comments by score and get top 10
  const topComments = data.Comments.sort((a, b) => b['Comment Score'] - a['Comment Score']).slice(0, 10);

  topComments.forEach((comment, index) => {
    blocks.push(createTextBlock(`Comment #${index + 1} (Score: ${comment['Comment Score']})`));
    addContentInChunks(blocks, comment['Comment Body']);
    if (index < topComments.length - 1) {
      blocks.push(createDividerBlock());
    }
  });

  return blocks;
}

function addContentInChunks(blocks, content) {
  let remainingContent = content;
  while (remainingContent.length > 0) {
    const chunk = remainingContent.slice(0, 2000);
    if (chunk.length > 0) {
      blocks.push(createTextBlock(chunk));
    }
    remainingContent = remainingContent.slice(2000);
  }
}

function createHeadingBlock(content, level) {
  return {
    object: 'block',
    type: `heading_${level}`,
    [`heading_${level}`]: {
      rich_text: [{ text: { content } }]
    }
  };
}

function createDividerBlock() {
  return {
    object: 'block',
    type: 'divider',
    divider: {}
  };
}

function createTextBlock(content) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ text: { content } }]
    }
  };
}

// Route to handle POST requests to '/data'
app.post('/data', (req, res) => {
  console.log('Received request:');
  console.log(req.body);  // Print the incoming JSON data to the console

  // Send a response back to the client
  res.status(200).send('Data received successfully');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
