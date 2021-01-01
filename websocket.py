#!/usr/bin/env python3

from websocket_server import WebsocketServer
import time
import sys
port = sys.argv[1]
import json
import data


    # クライアントが接続してきた時のイベント
def new_client(client, server):
    print('New client {}:{} has joined.'.format(client['address'][0], client['address'][1]))
    time.sleep(2)
    # クライアントへメッセージ送信
    server.send_message(client,json.dumps({"info":"接続できた"}))

# クライアントが切断した時のイベント
def client_left(client, server):
    print('Client {}:{} has left.'.format(client['address'][0], client['address'][1]))

# クライアントからのメッセージを受信した時のイベント
def message_received(client, server, message):
    message_dict = json.load(message)
    user,roomnumber,message = message_dict["user"],message_dict["roomnumber"],message_dict["message"]
    instance = data.database()
    instance.connect("chat","mychatapp")
    instance.create_chat(username=user,roomnumber=roomnumber,message=message)

    server.send_message_to_all(json.dumps({"message":message}))


if __name__ == "__main__":
    server = WebsocketServer(port=int(port), host='localhost')
    # イベントで使うメソッドの設定
    server.set_fn_new_client(new_client)
    server.set_fn_client_left(client_left)
    server.set_fn_message_received(message_received)
    # 実行
    server.run_forever()
