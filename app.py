from flask import Flask, render_template
from flask_cors import CORS
app = Flask(__name__, template_folder="./template")
CORS(app)


@app.route("/")
def hello_world():
    return render_template("main.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
