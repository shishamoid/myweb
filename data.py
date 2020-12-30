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

    def create_chat(self,roomnumber):
        self.mysql_instance.execute("create table roomnumber")
