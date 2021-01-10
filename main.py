# -*- coding:utf-8 -*-
import sys
from flask import Flask,request,jsonify

from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from flask_uwsgi_websocket import GeventWebSocket
from flask_restful import Resource, Api, marshal_with
#from flask_socketio import SocketIO,emit,send
#import bbbserial as bbb
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
import websockets
import hashlib
#from wsrequests import WsRequests
from websocket import create_connection

queue_size = 10

app = Flask(__name__, static_url_path='', static_folder='./dist/myweb')
app.config['JSON_AS_ASCII'] = False
app.config['SECRET_KEY'] = 'secret!'
CORS(app)

def json_serial(obj):
    if isinstance(obj, (datetime, datetime)):
        return datetime.strftime(obj,'%Y-%m-%d %H:%M:%S')
    raise TypeError ("Type %s not serializable" % type(obj))

@app.route('/', methods=['GET'])
def getAngular():
    #print(request.environ)
    print(request.url)
    return app.send_static_file('index.html')

@app.route("/login",methods=["GET"])
def get_info():

    pr = request.get_data()

    return app.send_static_file("index.html")

@app.route("/login",methods=["POST"])
def get_account():
    logininfo = json.loads(request.get_data().decode())
    print(logininfo)
    username = logininfo["username"]
    password = logininfo["password"]
    password= password.encode()
    password = hashlib.sha256(password).hexdigest()

    check = database()
    connectioncheck = check.connect(username="chat",password="mychatapp")

    if logininfo["request_type"] == "connect":

        logincheck = check.user_check(username=username,password=password)
        close=check.close_connection()
        response = json.dumps({"message": logincheck})
        return response

    if logininfo["request_type"] == "create":

        createcheck = check.create_user(username=username,password=password)
        close=check.close_connection()

        return json.dumps({"message":createcheck})

@app.route('/chat', methods=['GET'])
def getchat():
    data = request.get_data()
    a = data.decode("utf-8")

    if request.environ.get("wsgi.websocket"):
        print("chat accessed")
        host = "localhost"
        port = 5001
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.bind((host, port))
        server.listen(queue_size)
        client, address = server.accept()
        received_packet = client.recv()
        print(received_packet)
        receive = receive.decode("utf-8")

    return app.send_static_file('index.html')

@app.route("/chat",methods=["POST"])
def getid():
    query = json.loads(request.get_data().decode())
    request_type = query["request_type"]
    check = database()
    connectioncheck = check.connect(username="chat",password="mychatapp")
    print(request_type)
    password,roomname = query["password"],query["roomname"]
    password= password.encode()
    password = hashlib.sha256(password).hexdigest()

    if request_type=="connect":
        chat_messages,roomnumber = check.load_chat(roomname=roomname,password=password)
        if chat_messages=="まだルームがありません":
            return "roomを作成してください"
        else:
            #try:
            chat_port = int(roomnumber) +10000
            process = subprocess.Popen("python chat_server.py {} {}".format(chat_port,password),shell=True,stdout=subprocess.PIPE)
                #print("test",subprocess_output.communicate())
            flag = False
            time.sleep(0.5)
            response = {}

            response["message"] = chat_messages
            response["port"] = chat_port
            #time.sleep(3)
            #print(json.dumps(response,default=json_serial))
            return json.dumps(response,default=json_serial)

    elif request_type=="create":
        message = check.create_room(password=password,roomname=roomname)
        return message
    else:
        return "invalid request"

if __name__ == '__main__':
    app.debug = True
    app.run(port="5000",host="localhost")
