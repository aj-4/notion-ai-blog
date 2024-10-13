from flask import Flask, request, jsonify
import praw
import json

app = Flask(__name__)

# Initialize Reddit instance with credentials
reddit = praw.Reddit(
    client_id="Cyh84o1R4ERLEp1Xc-9XdQ",
    client_secret="SjhoePjeZ7sejUkKjOyZF_uW5Yzs2A",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
)

def scrape_submission_and_comments(url):
    # Get submission (post) object from URL
    submission = reddit.submission(url=url)
    
    # Ensure that all comments are loaded
    submission.comments.replace_more(limit=None)
    
    # Collect submission data (title, selftext, author)
    submission_data = {
        'Submission Title': submission.title,
        'Submission Text': submission.selftext,
        'Username': str(submission.author)
    }
    
    # Initialize an empty list to store comment data
    comments = []
    
    # Iterate over all comments in the submission
    for comment in submission.comments.list():
        comments.append({
            'Comment ID': comment.id,
            'Comment Body': comment.body,
            'Comment Score': comment.score,
            'Comment Created': comment.created_utc,
            'Parent ID': comment.parent_id,
            'Submission ID': comment.link_id,
            'Username': str(comment.author)  # Username of the commenter
        })
    
    # Add comments to the submission data
    submission_data['Comments'] = comments
    
    return submission_data

@app.route('/getData', methods=['POST'])
def get_data():
    url = request.json.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        submission_data = scrape_submission_and_comments(url)
        return jsonify(submission_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001)
