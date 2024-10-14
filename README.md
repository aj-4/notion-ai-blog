# Run the Notion AI Blog Builder

### 1. Copy Aaron Jack's Notion Blog Builder Template
[Here](https://circular-conga-1d1.notion.site/AI-Blog-Builder-11e657f5227b80848224d4e97aaeba79?pvs=4)

### 2. Create a Notion Integration
[Docs](https://www.notion.so/my-integrations)

### 3. Give the integration permission to your copied template
- Click on the ... More menu in the top-right corner of the page.
- Scroll down to + Add Connections.
- Search for your integration and select it.

### 4. Change SOURCES_DATABASE_ID and POSTS_DATABASE_ID variables
[Here's How](https://developers.notion.com/reference/retrieve-a-database)

### 5. Create a Reddit App here
https://www.reddit.com/prefs/apps

### 6. Save REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET variables

### 7. Install Dependencies
```sh
make -s install
```

### 8. Add Reddit URLs to the Sources Table in Notion
You can also add custom docs / copy paste from other sources
**Please use more than one so it is not blatant copying**

### 9. Run Script
```sh
make -s run
```

### 10. Edit & Publish Drafts in Notion
Then you can deploy your site
