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
async_mode = None

#from wsrequests import WsRequests

#wsr = WsRequests()

# login django

# Flaskオブジェクトを生成し、セッション情報暗号化のキーを指


#ws = GeventWebSocket(app)
# Flaskオブジェクト、async_modeを指定して、SocketIOサーバオブジェクトを生成
#socketio = SocketIO(app, async_mode=async_mode)
queue_size = 10

app = Flask(__name__, static_url_path='', static_folder='./dist/myweb')
app.config['JSON_AS_ASCII'] = False
app.config['SECRET_KEY'] = 'secret!'
CORS(app)

@app.route('/', methods=['GET'])
def getAngular():
    #print(request.environ)
    print(request.url)
    return app.send_static_file('index.html')

@app.route("/login",methods=["GET"])
def get_info():
    #print(request.environ)
    print("got account info")
    #print(request.environ)

    if request.environ.get("QUERY_STRING"):
        print(request.environ.get("QUERY_STRING"))
        getquery = request.environ.get("QUERY_STRING")
        print("ゲット",)
        return app.send_static_file("index.html")
    pr = request.get_data()
    #print(pr)
    return app.send_static_file("index.html")

@app.route("/login",methods=["POST"])
def get_account():
    logininfo = json.loads(request.get_data().decode())
    if logininfo["type"] == "connect":
        username = logininfo["username"]
        password = logininfo["password"]
        check = database()
        connectioncheck = check.connect(username="chat",password="mychatapp")
        logincheck = check.user_check(username=username,password=password)
        close=check.close_connection()
        response = json.dumps({"message": logincheck})

        return response

    if logininfo["type"] == "create":
        newusername = logininfo["newusername"]
        newpassword = logininfo["newpassword"]
        check = database()
        connectioncheck = check.connect(username="chat",password="mychatapp")
        createcheck = check.create_user(username=newusername,password=newpassword)
        close=check.close_connection()

        return json.dumps({"message":createcheck})

@app.route('/chat', methods=['GET'])
def getchat():
    print("this is a chat event")
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
        print("connected!@!")
        print(received_packet)

    return app.send_static_file('index.html')

@app.route("/chat",methods=["POST"])
def getid():
    query = json.loads(request.get_data().decode())
    print(query)
    type = query["type"]
    check = database()
    connectioncheck = check.connect(username="chat",password="mychatapp")
    if type=="connect":
        username,roomname = query["username"],query["roomname"]
        loaded_message,roomnumber = check.load_chat(roomname=roomname)
        print("ppppppppp")
        if loaded_message=="まだルームがありません":
            return "roomを作成してください"
        else:
            try:
                chat_port = int(roomnumber) +10000
                subprocess.Popen("python websocket.py {}".format(chat_port),shell=True)
            except OSError:
                pass
            #time.sleep(1)
            response = {}
            print("---")
            print(loaded_message)
            print(type(loaded_message))
            print(loaded_message[0])
            print("0000")
            print(type(loaded_message[0]))
            print("11111")
            print(type(loaded_message[0]))
            #print(type(loaded_message[0][0][2]))
            response["message"] = dict(loaded_message)
            response["port"] = chat_port
            return json.dumps(response)

    elif type=="create":
        roomname = query["roomname"]
        print(roomname)
        message = check.create_room(roomname=roomname)
        return message
    else:
        return "invalid request"

"""@app.route("/<string:name>",methods=['GET',"POST"])
def namepage(name):
    if name=="/login":
        print("this is login")
        return app.send_static_file("index.html")

    return app.static_url_path"""
    #return app.send_static_file("index.html")

#print(request.environ)
"""@app.route("/<string:name>",methods=['GET'])
def namepage(name):
    print(request)
    print("name",name)
    print("aaaaaaaaaa")
    return app.send_static_file("index.html")
    #return app.send_static_file("index.html")

@ws.route('/chat')
def chat(ws):
    print(ws)
    print("ringos")
    users[ws.id] = ws

    for msg in backlog:
        ws.send(msg)

    while True:
        msg = ws.receive()
        if msg is None:
            break
        if msg == b"":
            continue

        backlog.append(msg)
        for id in users:
            if id != ws.id:
                users[id].send(msg)

    del users[ws.id]
    return"""

"""
@socketio.on('connect', namespace='/chat')
def test_connect():
    print('Client connected')
    return "poke"
    """

if __name__ == '__main__':
    app.debug = True
    #server = WSGIServer(('localhost', 5000), app, handler_class=WebSocketHandler)
    #server.serve_forever()
    app.run(port="5000",host="localhost")
    #socket.run(app,debug=True)
    #print("app running")
    """host = "localhost"
    port = 8080

    host_port = (host, port)
    server = WSGIServer(
       host_port,
       app,
       handler_class=WebSocketHandler
    )
    server.serve_forever()"""
