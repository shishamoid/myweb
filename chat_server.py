#!/usr/bin/env python3

from websocket_server import WebsocketServer
import time
import sys
port = sys.argv[1]
import json
import data
import ast
import websocket

    # クライアントが接続してきた時のイベント
def new_client(client, server):
    print('New client {}:{} has joined.'.format(client['address'][0], client['address'][1]))
    # クライアントへメッセージ送信
    server.send_message(client,json.dumps({"info":"接続できた"}))


# クライアントが切断した時のイベント
def client_left(client, server):
    print('Client {}:{} has left.'.format(client['address'][0], client['address'][1]))

# クライアントからのメッセージを受信した時のイベント
def message_received(client, server, message):
    message_dict = json.loads(message,encoding="utf-8")

    user,roomname,message,time = message_dict["user"].encode("iso_8859_1").decode("utf-8"),\
    message_dict["roomname"].encode("iso_8859_1").decode("utf-8"),message_dict["message"].encode("iso_8859_1").decode("utf-8"),message_dict["time"]

    instance = data.database()
    instance.connect("chat","mychatapp")
    roomnumber = instance.check_room(roomname=roomname)
    return_message = instance.create_chat(username=user,roomnumber=roomnumber,message=message,time_str=time)
    server.send_message_to_all(json.dumps({"message":return_message},ensure_ascii=False))

if __name__ == "__main__":
    try:
        server = WebsocketServer(port=int(port), host='localhost')
        print("1")
        # イベントで使うメソッドの設定
        server.set_fn_new_client(new_client)
        print("2")
        server.set_fn_client_left(client_left)
        print("3")
        server.set_fn_message_received(message_received)
        print('4')
        # 実行
        server.run_forever()

    except OSError:
        pass
