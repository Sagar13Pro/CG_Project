This is Python app, so directly running the code will not work, mandatory Python to be installed.  

Follow this steps to run: 

1. Open the folder in terminal. Then run python -m venv venv. This will create a venv file in the project folder.

2. activate the envirnoment or :
    [windows] => venv/Scripts/activate
    [mac] => source /venv/bin/activate. 

    For more, https://docs.python.org/3/library/venv.html

3. Now run pip install -r requirements.txt 

4. After this run python app.py, will start the project on localhost with port 8000. So open browser and hit http://localhost:8000

Note, You have pick teapot.js from the static/vertices folder while browsering the file.