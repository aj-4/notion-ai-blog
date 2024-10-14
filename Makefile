install:
		python3 -m venv venv; \
    source ./venv/bin/activate; \
    pip install -r requirements.txt; \
		npm install;

run:
	set -e; \
	source ./venv/bin/activate; \
	node index.js & npm_pid=$$!; \
	python3 main.py & python_pid=$$!; \
	trap 'kill -TERM $$npm_pid $$python_pid' EXIT; \
	echo "Waiting for server to start..."; \
	while ! nc -z localhost 3000; do \
	    sleep 1; \
	done; \
	curl http://localhost:3000/scrapeNotionLinks; \
	kill -TERM $$npm_pid $$python_pid
