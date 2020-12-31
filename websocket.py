import sys

import socket
receive_buffer_size = 4096
roomnumber = sys.argv[1]

host = "localhost"
port = int(roomnumber) + 2000

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print(host,port)
#try:
port = 12345
server.bind((host, port))
server.listen()

#try:
while True:
    print("待機中")
    client, address = server.accept()

    received_packet = client.recv(receive_buffer_size)
    print(received_packet)
    #server.sendmsg("connected!".encode())
    #client.sendall("connected!".encode(encoding='utf_8'))

#pass
