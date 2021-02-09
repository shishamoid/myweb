# -*- coding:utf-8 -*-
import sys
from flask import Flask,request,jsonify,make_response,render_template,send_file

from threading import Thread
import time
import socket
from flask_cors import CORS
import json
from data import database
import subprocess
from subprocess import PIPE
async_mode = None
from datetime import datetime
#import websockets
import hashlib
#from wsrequests import WsRequests
#from websocket import create_connection
import logging
# ログレベルを DEBUG に変更
logging.basicConfig(level=logging.INFO)
import boto3
from boto3.dynamodb.conditions import Key
import random, string


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("session_manegement")

queue_size = 10

app = Flask(__name__, static_url_path='', static_folder='./dist/myweb',template_folder="./dist/myweb")
app.config['JSON_AS_ASCII'] = False
app.config['SECRET_KEY'] = 'secret!'
CORS(app)

def json_serial(obj):
    if isinstance(obj, (datetime, datetime)):
        return datetime.strftime(obj,'%Y-%m-%d %H:%M:%S')
    raise TypeError ("Type %s not serializable" % type(obj))

def hash_function(string):
    encode_string = string.encode()
    hash = hashlib.sha256(encode_string).hexdigest()
    return hash

def make_session_id(length):
    return ''.join([random.choice(string.ascii_letters + string.digits) for i in range(length)])


@app.route('/', methods=['GET'])
def getAngular():
    print("accessed!")
    return render_template('./index.html')

@app.route("/login",methods=["GET"])
def get_info():
    print("login get")
    r = request.get_data()

    return render_template("index.html")

@app.route("/login",methods=["POST"])
def get_account():
    print("login accessed!")
    logininfo = json.loads(request.get_data().decode())
    print("logininfo",logininfo)
    username = logininfo["username"]
    username = hash_function(username)
    password = logininfo["password"]
    password = hash_function(password)

    check = database()
    connectioncheck = check.connect(username="chat",password="mychatapp")

    if logininfo["request_type"] == "connect":

        logincheck = check.user_check(username=username,password=password)
        close=check.close_connection()
        response = json.dumps({"message": logincheck})

        if logincheck=="ログイン成功":
            #cookieセット\
            print("logincheck",logincheck)
            print("check.username",check.username)
            print("username",username)
            #セッションスタート
            sessionid = make_session_id(100)
            table.put_item(Item={"sessionid":sessionid,"userid":username})
            cookie = make_response(response)
            cookie.set_cookie("sessionid",value=sessionid)

            return cookie
        else:
            return response

    if logininfo["request_type"] == "create":

        createcheck = check.create_user(username=username,password=password)
        close=check.close_connection()

        return json.dumps({"message":createcheck})

@app.route('/chat', methods=['GET'])
def getchat():
    data = request.get_data()
    client_username = request.args.get("username")
    print("client_username",client_username)
    a = data.decode("utf-8")
    #cookieチェック
    client_sessionid = request.cookies.get("sessionid")
    server_username = table.get_item(Key={"sessionid":client_sessionid})["Item"]["userid"]
    print("client_sessionid",client_username)
    print("server_sessionid",server_username)

    if client_username==server_username:
        print("あってる")
        return render_template('index.html',error="nothing")
    else:
        print("セッション情報がありません")
        return send_file("error.html")

@app.route("/chat",methods=["POST"])
def getid():
    query = json.loads(request.get_data().decode())
    request_type = query["request_type"]
    check = database()
    connectioncheck = check.connect(username="chat",password="mychatapp")
    print(request_type)

    password,roomname = query["password"],query["roomname"]
    password = hash_function(password)
    roomname = hash_function(roomname)

    if request_type=="connect":
        chat_messages,roomnumber = check.load_chat(roomname=roomname,password=password)
        if chat_messages=="まだルームがありません":
            return "roomを作成してください"
        else:
            #try:
            chat_port = int(roomnumber) +10000
            print("chat_port",chat_port)
            process = subprocess.Popen("python chat_server.py {} {}".format(chat_port,password),shell=True)
                #print("test",subprocess_output.communicate())
            print("chat_messages",chat_messages)

            flag = False
            time.sleep(2)
            response = {}
            response["message"] = chat_messages
            response["port"] = chat_port

            #cookieのセッションidでdbと照合
            response["username"] = "undefined"

            return json.dumps(response,default=json_serial)

    elif request_type=="create":
        message = check.create_room(password=password,roomname=roomname)
        print("create response",message)
        return message
    else:
        return "invalid request"


if __name__ == '__main__':
#app.debug = True
    app.run()
