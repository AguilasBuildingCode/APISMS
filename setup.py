import uuid
import os
import random
import string

node_env = os.environ['NODE_ENV']

def getKey(length):
    return ''.join(random.SystemRandom().choice(string.ascii_lowercase + string.ascii_uppercase + string.digits + "-") for _ in range(length))

if node_env != None and node_env != '':
    os.system('tsc')

    current_path = os.getcwd()
    dist_path = os.path.join(current_path, 'dist')
    cert_path = os.path.join(dist_path, 'cert')

    if os.path.exists(dist_path):
        logs_path = os.path.join(dist_path, 'logs')
        if not os.path.exists(logs_path):
            os.mkdir(logs_path)
        env_file_path = os.path.join(dist_path, f'.{node_env}.env')
        if not os.path.exists(env_file_path):
            file = open(env_file_path, 'w+')
            file.write('PORT_API_HTTP=80\n')
            file.write('PORT_API_HTTPS=443\n')
            file.write(f'JWT_SECRET={uuid.uuid4()}\n')
            file.write(f'PPK_SECRET={uuid.uuid4()}\n')
            file.write(f'AES_SECRET={getKey(32)}\n')
            file.write(f'ROOT_USER_ID={uuid.uuid4()}\n')
            file.write('BUSSINES_NAME=\n')
            file.write('LEGAL_REP=\n')
            file.write('ROOT_USER_NAME=\n')
            file.write(f'ROOT_USER_PASSWORD={uuid.uuid4()}\n')
            file.write('ROOT_USER_TYPE=ROOT\n')
            file.close()
        if not os.path.exists(cert_path):
            os.mkdir(cert_path)
        
else:
    print('NODE_ENV not found')