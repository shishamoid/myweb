import MySQLdb

class database():

    def __init__(self):
        self.username = ""
        self.password = ""

    def connect(self,username,password):
        flag = False
        try:

            self.mysql_connection = MySQLdb.connect(user= username,password= password,host="localhost",db="user_room_list",charset="utf8")
            self.mysql_instance = self.mysql_connection.cursor()
            self.mysql_connection.commit()
            flag = True
            return flag
        except Exception as e:
            print(e)
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

    def create_room(self,roomname):
        check_result = self.check_room(roomname=roomname)
        if check_result == "まだルームがありません":
            try:
                #roomをroomlistに登録
                self.mysql_instance.execute("insert into user_room_list.room_list(roomname) values('{}')".format(str(roomname)))
                result = self.mysql_instance.fetchall()
                self.mysql_connection.commit()

                #roomlistからroomnumberを取得　
                self.mysql_instance.execute("select room_number from user_room_list.room_list where roomname='{}'".format(roomname))
                result = self.mysql_instance.fetchall()
                self.mysql_connection.commit()

                #roomnumberでtableをつくる timeはクライアントからおくられてくるのを使う
                self.mysql_instance.execute("create table if not exists chatmessages.roomnumber_{}(username varchar(30),message varchar(100),time datetime)".format(str(result[0][0])))
                result = self.mysql_instance.fetchall()
                self.mysql_connection.commit()

                return "roomの作成に成功しました"
            except Exception as e:
                print(e)
                return "roomの作成に失敗しました"

        else:
            return "すでにルームがあります"

    def check_room(self,roomname):
        self.mysql_instance.execute("select room_number from user_room_list.room_list where roomname='{}'".format(roomname))
        search_result = self.mysql_instance.fetchall()

        if len(search_result)==0:
            return "まだルームがありません"
        else:
            #roomがあるならroomnumberを返す
            return search_result[0][0]

    def load_chat(self,roomname):
        check_result = self.check_room(roomname=roomname)   #roomがあるなら、check_resultにroomnumberがはいる
        if check_result == "まだルームがありません":
            return check_result,"_"
        else:
            self.mysql_instance.execute("select username,message,time from chatmessages.roomnumber_{}".format(check_result))
            result = self.mysql_instance.fetchall()
            self.mysql_connection.commit()

            return result,check_result


    def create_chat(self,roomnumber,username,message,time_str):
        try:
            self.mysql_instance.execute("select cast('{}' as datetime)".format(time_str))
            time_tuple = self.mysql_instance.fetchall()
            time = time_tuple[0][0]
            self.mysql_instance.execute("insert into chatmessages.roomnumber_{}(username,message,time) values('{}','{}','{}')".format(roomnumber,username,message,time))
            self.mysql_connection.commit()
            message = "メッセージを送りました"
        except Exception as e:
            print("sql error",e)
            message = "メッセージを送れませんでした。"
            pass
        return message

if __name__=="__main__":

    check = database()
    connectioncheck = check.connect(username="chat",password="mychatapp")
    create_user = check.create_user(username="test",password="test")
    logincheck = check.user_check(username="test",password="test")
    create_chat = check.create_room("test")
    print(check.load_chat("test"))
    check.create_chat(roomnumber="test",username="testuser",message="test")
