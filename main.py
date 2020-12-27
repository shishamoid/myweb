 # -*- coding:utf-8 -*-
import sys
from flask import Flask,request,jsonify

from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from flask_uwsgi_websocket import GeventWebSocket
from flask_restful import Resource, Api, marshal_with
from flask_socketio import SocketIO,emit,send
#import bbbserial as bbb
from threading import Thread
import time
import socket
async_mode = None


# Flaskオブジェクトを生成し、セッション情報暗号化のキーを指定
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

ws = GeventWebSocket(app)
# Flaskオブジェクト、async_modeを指定して、SocketIOサーバオブジェクトを生成
socketio = SocketIO(app, async_mode=async_mode)
queue_size = 10

app = Flask(__name__, static_url_path='', static_folder='./dist/myweb')
app.config['JSON_AS_ASCII'] = False

@app.route('/', methods=['GET'])
def getAngular():
    #print(request.environ)
    print(request.url)
    return app.send_static_file('index.html')


@app.route('/chat', methods=['GET'])
def getchat():
    print("this is a chat event")
    data = request.get_data()
    a = data.decode("utf-8")
    print(request.environ)
    print(a)

    #print(request.environ.get("wsgi.websocket"))
    #print(request.data.decode("utf-8"))
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

#print(request.environ)
"""@app.route("/<string:name>",methods=['GET'])
def namepage(name):
    print(request)
    print("name",name)
    print("aaaaaaaaaa")
    return app.send_static_file("index.html")"""
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
    return


@socketio.on('connect', namespace='/chat')
def test_connect():
    print('Client connected')
    return "poke"

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
