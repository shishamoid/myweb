# -*- coding:utf-8 -*-
import sys,os,glob
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

import hashlib
#from wsrequests import WsRequests
#from websocket import create_connection
import logging
# ログレベルを DEBUG に変更
logging.basicConfig(level=logging.INFO)
import boto3
from boto3.dynamodb.conditions import Key
import random, string

from gql import gql, Client
#from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.requests import RequestsHTTPTransport
#gql.transport.aiohttp.AIOHTTPTransport

transport = RequestsHTTPTransport(
    url='https://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com/graphql',
    headers={"x-api-key":"da2-puirc5dyvrhzjljjhcdyglhvya"}
)

client = Client(transport=transport, fetch_schema_from_transport=True)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("MywebChatTable")
#table.update_item(Item={"sessionid":"5718","username":"testfromubuntu"})
"""table.update_item(
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


def json_serial(obj):
    if isinstance(obj, (datetime, datetime)):
        return datetime.strftime(obj,'%Y-%m-%d %H:%M:%S')
    raise TypeError ("Type %s not serializable" % type(obj))

def hash_function(string):
    encode_string = string.encode()
    hash = hashlib.sha256(encode_string).hexdigest()
    for _ in range(5000):
        hash = hashlib.sha256(hash.encode()).hexdigest()
    return hash

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

    return render_template("./index.html")

@app.route("/login",methods=["GET"])
def get_info():
    print("login get")
    r = request.get_data()

    return render_template("index.html")

@app.route("/login",methods=["POST"])
def get_account():
    logininfo = json.loads(request.get_data().decode())
    print("logininfo",logininfo)
    username = logininfo["username"]
    password = logininfo["password"]
    request_type = logininfo["request_type"]

    if form_check(username,password,request_type):

        password = hash_function(password)
        #username = hash_function(username)

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
                table.put_item(Item={"sessionid":sessionid,"username":username})
                cookie = make_response(response)
                cookie.set_cookie("sessionid",value=sessionid)
                return cookie
            else:
                return response

        if logininfo["request_type"] == "create":
            createcheck = check.create_user(username=username,password=password)
            close=check.close_connection()
            return json.dumps({"message":createcheck})

    else:
        return "認証エラー"

@app.route("/stopwatch",methods=["GET"])
def getstopwatch():
    return render_template("index.html")

@app.route('/chat', methods=['GET'])
def getchat():
    data = request.get_data()
    #cookieチェック
    client_sessionid = request.cookies.get("sessionid")

    server_username = table.get_item(Key={"sessionid":client_sessionid})["Item"]["username"]
    try:
        server_username = table.get_item(Key={"sessionid":client_sessionid})["Item"]["username"]
    except KeyError:
        print("cookieに対応するusernameはありません")
        return send_file("error.html")

    #if client_username==server_username:
    return render_template('index.html',error="nothing")

@app.route("/chat",methods=["POST"])
def getid():
    query = json.loads(request.get_data().decode())
    request_type,password,roomname= query["request_type"],query["password"],query["roomname"]
    #client_username = hash_function(client_username)
    client_sessionid = request.cookies.get("sessionid")
    server_username = table.get_item(Key={"sessionid":client_sessionid})["Item"]["username"]
    #roomname = table.get_item(Key={"sessionid":client_sessionid})["Item"]["roomname"]
    print("client_sessionid",client_sessionid)
    print("server_username",server_username)
    print(form_check(username=roomname,password=password,request_type=request_type))

    if not form_check(username=roomname,password=password,request_type=request_type):
        print("invalid form type")
        return "invalid request"
    else:
        print("OK")

    check = database()

    print("接続できた")
    password = hash_function(password)

    if request_type=="create":
        message = check.create_room(password=password,roomname=roomname)
        #print("create response",message)
        return message

    elif request_type=="connect":

        #chat_messages = check.load_chat(roomname=roomname,password=password)
        # Provide a GraphQL query
        chat_messages = "適当"

        if chat_messages=="まだルームがありません":
            return "roomを作成してください"
        else:
            sessionid_1 = '"{}"'.format(client_sessionid)
            query = gql(
                """
                query getChatHistory {
                  getChatHistory(sessionid:""" + sessionid_1 + """) {
                    username
                    message
                    timestamp
                  }
                }
            """
            )

            # Execute the query on the transport
            result = client.execute(query)["getChatHistory"]
            #print(result)

            response = {}
            #response["message"] = chat_messages
            #print("result")
            #response["message"] = [result[:]["message"],result[:]["username"],result[:]["timestamp"]]
            response["message"] = result
            response["username"] = server_username

            response_json = json.dumps(response)
            #response = make_response(response_json)

            #roomnameの項目を追加
            try:
                table.update_item(
                        Key={"sessionid":client_sessionid},
                        UpdateExpression="set roomname = :tmp",
                        ExpressionAttributeValues={
                            ':tmp': roomname
                        })

            except Exception as e:
                print(e)
                return e

            #print(response_json)
            return response_json


if __name__ == '__main__':
    #app.debug = True
    app.run()
