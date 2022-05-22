# -*- coding:utf-8 -*-
from flask import Flask,request,jsonify,make_response,render_template,send_file

from flask_cors import CORS
import json
import logging

logging.basicConfig(level=logging.INFO)

import random, string

app = Flask(__name__, static_url_path='', static_folder='dist/myweb',template_folder="dist/myweb")
app.config['JSON_AS_ASCII'] = False
app.config['SECRET_KEY'] = 'secret!secret!'
CORS(app)

def make_session_id(length):
    return ''.join([random.choice(string.ascii_letters + string.digits) for i in range(length)])


@app.route('/', methods=['GET'])
def getAngular():
    sessionid = make_session_id(99)
    response = make_response(render_template("./index.html"))
    response.set_cookie("sessionid",value=sessionid,secure=True)
    return response

@app.route("/login",methods=["GET"])
def get_info():
    return render_template("index.html")

@app.route("/others",methods=["GET"])
def get_others():
    return render_template("index.html")

@app.route("/stopwatch",methods=["GET"])
def getstopwatch():
    return render_template("index.html")

@app.route('/chat', methods=['GET'])
def getchat():
    return render_template('index.html')

if __name__ == '__main__':
    app.run()
