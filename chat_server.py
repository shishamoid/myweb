#!/usr/bin/env python3
import time
import sys
port = sys.argv[1]
password = sys.argv[2]
import json
import data
from main import hash_function

from flask import Flask,request,jsonify,make_response,render_template,send_file
from websocket_server import WebsocketServer
import boto3
from boto3.dynamodb.conditions import Key
"""

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("chat_session")
# テーブルスキャン
def operation_scan():
    scanData = table.scan()
    items=scanData['Items']
    #print(scanData)
    return items
"""
#import ast
#import websocket

    # クライアントが接続してきた時のイベント
def new_client(client, server):
    print('New client {}:{} has joined.'.format(client['address'][0], client['address'][1]))

    # クライアントへメッセージ送信
    #server.send_message(client,json.dumps({"info":"接続できた"}))

# クライアントが切断した時のイベント
def client_left(client, server):
    print('Client {}:{} has left.'.format(client['address'][0], client['address'][1]))

# クライアントからのメッセージを受信した時のイベント
def message_received(client, server, message):
    message_dict = json.loads(message,encoding="utf-8")
    username,roomname,message,time = message_dict["username"].encode("iso_8859_1").decode("utf-8"),\
    message_dict["roomname"].encode("iso_8859_1").decode("utf-8"),message_dict["message"].encode("iso_8859_1").decode("utf-8"),message_dict["time"]
    print("received",message)
    print(client)
    print("username",username)

    #session確認
    #operation_scan()["new_login"]

    instance = data.database()
    instance.connect("chat","mychatapp")
    roomname = hash_function(roomname)
    roomnumber = instance.check_room(roomname=roomname,password=password)
    instance.create_chat(username=username,roomnumber=roomnumber,message=message,time_str=time)
    print("send_message",message)
    server.send_message_to_all(json.dumps({"username":username,"message":message,"time":time},ensure_ascii=False))

if __name__ == "__main__":
    try:
        server = WebsocketServer(port=int(port), host='localhost')
        # イベントで使うメソッドの設定
        server.set_fn_new_client(new_client)
        server.set_fn_client_left(client_left)
        server.set_fn_message_received(message_received)
        # 実行
        server.run_forever()

    except OSError as e:
        print(e)
        pass
