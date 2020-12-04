# -*- coding:utf-8 -*-
import sys
from flask import Flask

#import MeCab

app = Flask(__name__, static_url_path='', static_folder='./dist/myweb')
app.config['JSON_AS_ASCII'] = False

@app.route('/', methods=['GET'])
def getAngular():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run()
