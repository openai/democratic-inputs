from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/', methods = ['GET'])
def main():
  return jsonify({'status': 'up'})

if __name__ == '__main__':
  import dotenv
  app.run(debug = True)
