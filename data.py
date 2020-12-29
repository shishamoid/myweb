import MySQLdb

def connect(roomnum,username,password):
    flag = False
    try:
        MySQLdb.connect(user= user,password= password,host="localhost",db="mysql")
        flag = True
    except:
        pass
    return flag

def create_user(roomnum,username,password,cursor):
    cursor.execute("")
