# -*- coding:utf-8 -*-
#import sys,os
from flask import Flask,request,jsonify,make_response,render_template,send_file

#from threading import Thread
import time
#import socket
from flask_cors import CORS
import json
#from data import database
import subprocess
from subprocess import PIPE
async_mode = None
#from datetime import datetime

import hashlib
#from wsrequests import WsRequests
#from websocket import create_connection
import logging
# ログレベルを DEBUG に変更
logging.basicConfig(level=logging.INFO)
#import boto3
#from boto3.dynamodb.conditions import Key
import random, string

#from gql import gql, Client
#from gql.transport.aiohttp import AIOHTTPTransport
#from gql.transport.requests import RequestsHTTPTransport
#gql.transport.aiohttp.AIOHTTPTransport
"""
transport = RequestsHTTPTransport(
    url='https://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com/graphql',
    headers={"x-api-key":"da2-puirc5dyvrhzjljjhcdyglhvya"}
)

client = Client(transport=transport, fetch_schema_from_transport=True)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("MywebChatTable")
#table.update_item(Item={"sessionid":"5718","username":"testfromubuntu"})
table.update_item(
        Key={"sessionid":"test"},
        UpdateExpression="set username = :tmp",
        ExpressionAttributeValues={
            ':tmp': 'test2'
        })"""


queue_size = 10

app = Flask(__name__, static_url_path='', static_folder='dist/myweb',template_folder="dist/myweb")
app.config['JSON_AS_ASCII'] = False
app.config['SECRET_KEY'] = 'secret!'
CORS(app)

"""
def json_serial(obj):
    if isinstance(obj, (datetime, datetime)):
        return datetime.strftime(obj,'%Y-%m-%d %H:%M:%S')
    raise TypeError ("Type %s not serializable" % type(obj))
"""

def hash_function(string):
    encode_string = string.encode()
    hash = hashlib.sha256(encode_string).hexdigest()
    for _ in range(5000):
        hash = hashlib.sha256(hash.encode()).hexdigest()
    return hash
print(len(hash_function("poke")))

def make_session_id(length):
    return ''.join([random.choice(string.ascii_letters + string.digits) for i in range(length)])

def form_check(username,password,request_type):
    password = password.replace("_","1")
    flag = True

    if not request_type in ["create","connect"]:
        print("不正なリクエストです")
        flag =  False

    if (len(username)>=20):
        print("invalid username : length {}".format(len(username)))
        flag =  False

    if (len(password)<=6 or len(password)>=20):
        print("invalid password : length {}".format(len(password)))
        flag =  False

    if password.encode('utf-8').isalnum() == False:
        flag =  False

    return flag


@app.route('/', methods=['GET'])
def getAngular():
    print("accessed!")
    sessionid = make_session_id(99)
    response = make_response(render_template("./index.html"))
    response.set_cookie("sessionid",value=sessionid)
    return response

@app.route("/login",methods=["GET"])
def get_info():
    print("login get")
    #r = request.get_data()

    return render_template("index.html")

@app.route("/stopwatch",methods=["GET"])
def getstopwatch():
    return render_template("index.html")

@app.route('/chat', methods=['GET'])
def getchat():
    data = request.get_data()
    """
    try:
        #cookieチェック
        client_sessionid = request.cookies.get("sessionid")
        server_username = table.get_item(Key={"sessionid":client_sessionid})["Item"]["username"]
    except KeyError:
        print("cookieに対応するusernameはありません")
        return send_file("error.html")
    """
    #if client_username==server_username:
    return render_template('index.html',error="nothing")


if __name__ == '__main__':
    #app.debug = True
    app.run()
