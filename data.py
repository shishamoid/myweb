import MySQLdb

class database():

    def __init__(self):
        self.username = ""
        self.password = ""

    def connect(self,username,password):
        flag = False

        self.mysql_connection = MySQLdb.connect(user= username,password= password,host="localhost",db="login")
        self.mysql_instance = self.mysql_connection.cursor()
        flag = True

        return flag

    def user_check(self,username,password):
        message = ""
        self.mysql_instance.execute("select password from userlist where username='{}'".format(username))
        result = self.mysql_instance.fetchall()
        self.mysql_connection.commit()

        if len(result)==1:
            got_pass = result[0][0]
            if got_pass == password:
                self.username = username
                return "ログイン成功"
            else:
                return "パスワードが違います"

        elif len(result)==0:
            return "ユーザーがいません"
        else:
            return "sqlエラー =>" + str(result)

    def create_user(self,username,password):
        check = self.user_check(username,password)
        if check == ("ログイン成功" or "パスワードが違います"):
            return "ユーザーがすでにいます。"
        else:
            self.mysql_instance.execute("insert into userlist values('{}','{}')".format(username,password))
            result = self.mysql_instance.fetchall()
            self.mysql_connection.commit()
            print("ユーザが作成されました")
            print(result)
            return result

    def close_connection(self):
        self.mysql_connection.commit()
        self.mysql_connection.close()

    def create_room(self,roomnumber):
        check_result = self.check_room(roomnumber=roomnumber)
        if check_result == "すでにルームがあります":
            return "すでにルームがあります"
        else:
            try:
                self.mysql_instance.execute("create table if not exists chatmessages.roomnumber_{}(username varchar(30),message varchar(100),time timestamp \
                default current_timestamp)".format(roomnumber))
                result = self.mysql_instance.fetchall()
                self.mysql_connection.commit()
                return "roomの作成に成功しました"
            except:
                return "roomの作成に失敗しました"

    def check_room(self,roomnumber):
        self.mysql_instance.execute("show tables from chatmessages like 'roomnumber_{}'".format(roomnumber))
        search_result = self.mysql_instance.fetchall()
        if len(search_result)==0:
            return "まだルームがありません"
        else:
            return "すでにルームがあります"

    def load_chat(self,roomnumber):
        check_result = self.check_room(roomnumber=roomnumber)
        if check_result == "すでにルームがあります":
            self.mysql_instance.execute("select username,message,time from chatmessages.roomnumber_{}".format(roomnumber))
            result = self.mysql_instance.fetchall()
            self.mysql_connection.commit()
            return result
        else:
            return check_result
            #print(result)

    def create_chat(self,roomnumber,username,message):
        try:
            self.mysql_instance.execute("insert into chatmessages.roomnumber_{}(username,message) values('{}','{}')".format(roomnumber,username,message))
            self.mysql_connection.commit()
            message = "メッセージを送りました"
        except:
            message = "メッセージを送れませんでした。"
            pass
        return flag

if __name__=="__main__":

    check = database()
    connectioncheck = check.connect(username="chat",password="mychatapp")
    create_user = check.create_user(username="test",password="test")
    logincheck = check.user_check(username="test",password="test")
    create_chat = check.create_room("test")
    print(check.load_chat("test"))
    check.create_chat(roomnumber="test",username="testuser",message="test")
