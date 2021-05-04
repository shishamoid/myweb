import pymysql

import sys
import json



class database():

    database_key = json.load(open("./awskeys.json"))["stage"]["dev"]
    def __init__(self,database_key=database_key):
        self.username = ""
        self.password = ""
        self.database_key = database_key

    def connect(self,username,password):
        flag = False
        try:
            self.mysql_connection = pymysql.connect(user= username,password= password,host=self.database_key,db="user_room_list",charset="utf8")
            self.mysql_instance = self.mysql_connection.cursor()
            self.mysql_connection.commit()
            flag = True
            return flag
        except Exception as e:
            print(e)
            sys.exit()
            return flag

    def user_check(self,username,password):
        try:
            message = ""
            self.mysql_instance.execute("select password from user_list where username='{}'".format(username))
            result = self.mysql_instance.fetchall()
            self.mysql_connection.commit()

            if len(result)==1:
                got_pass = result[0][0]
                if got_pass == password:
                    self.username = username
                    return "ログイン成功"
                else:
                    return "ログイン失敗"
            else:
                return "ログイン失敗"

        except Exception as e:
            return "sqlエラー =>" + str(e)

    def create_user(self,username,password):
        check = self.user_check(username,password)
        if check == "ログイン成功":
            return "ユーザーがすでにいます"
        else:
            try:
                self.mysql_instance.execute("insert into user_room_list.user_list(username,password) values('{}','{}')".format(username,password))
                result = self.mysql_instance.fetchall()
                self.mysql_connection.commit()

                return "ユーザーが作成されました"

            except Exception as e:
                print("sql error",e)
                return "ユーザーの作成に失敗しました"


    def close_connection(self):
        self.mysql_connection.commit()
        self.mysql_connection.close()

    def create_room(self,roomname,password):
        check_result = self.check_room(roomname=roomname,password=password)
        if check_result == "まだルームがありません":
            try:
                #roomをroomlistに登録
                self.mysql_instance.execute("insert into user_room_list.room_list(roomname,password) values('{}','{}')".format(roomname,password))
                result = self.mysql_instance.fetchall()
                self.mysql_connection.commit()

                #roomlistからroomnumberを取得
                """
                self.mysql_instance.execute("select room_number from user_room_list.room_list where room_name='{}'".format(roomname))
                result = self.mysql_instance.fetchall()
                self.mysql_connection.commit()
                """

                #roomnumberでtableをつくる timeはクライアントからおくられてくるのを使う
                """
                self.mysql_instance.execute("create table if not exists chatmessages.roomnumber_{}(username varchar(30),message varchar(100),time datetime)".format(str(result[0][0])))
                result = self.mysql_instance.fetchall()
                self.mysql_connection.commit()
                """

                return "roomの作成に成功しました"
            except Exception as e:
                print(e)
                return "roomの作成に失敗しました"

        else:
            return "すでにルームがあります"

    def check_room(self,roomname,password):
        self.mysql_instance.execute("select roomname from user_room_list.room_list where roomname='{}' and password='{}'".format(roomname,password))
        search_result = self.mysql_instance.fetchall()
        if len(search_result)==0:
            return "まだルームがありません"
        else:
            #roomがあるならroomnumberを返す
            return search_result[0][0]

    def load_chat(self,roomname,password):
        check_result = self.check_room(roomname=roomname,password=password)   #roomがあるなら、check_resultにroomnumberがはいる
        if check_result == "まだルームがありません":
            return check_result
        else:
            self.mysql_instance.execute("select username,message,timestamp from chatmessages.chathistory where roomname='{}'".format(check_result))
            result = self.mysql_instance.fetchall()
            self.mysql_connection.commit()
            return result

if __name__=="__main__":

    check = database()
    connectioncheck = check.connect(username="chat",password="mychatapp")
    create_user = check.create_user(username="testuser",password="testpass")
    logincheck = check.user_check(username="test",password="test")
    create_chat = check.create_room("testroom","testpassword")
    print(check.load_chat("testroom","testpassword"))
    result = check.load_chat("testroom","testpassword")
    print(result)
    import json
    json.dumps(result)
