from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from ..OpenstackCommunication.Authenticate import Authenticate
from ..OpenstackCommunication.StartInstance import StartInstance
from ..OpenstackCommunication.CreateRouter import CreateRouter
from ..OpenstackCommunication.CreateNetwork import CreateNetwork
from ast import literal_eval
import os

PROJECT_PATH = os.path.realpath(os.path.dirname(__file__))


def index(request):
    return render_to_response('index.html')


@csrf_exempt
def returnjson(request):
    if request.is_ajax():
        request_data = request.body
        data = literal_eval(str(request_data.decode()))
        node_info = data[0]
        edge_info = data[1]
        #Temporary Values - This would be filled in by user input later.
        auth = Authenticate(auth="http://10.14.192.248:5000/v3", user="admin", passwd="24df4e1f03fe4932",
                            proj_name="admin", user_domain="default", project_domain="default")
        session = auth.start_auth()
        for device_id in node_info:
            if 'vm' in device_id.get("image"):
                print(device_id.get("id"))
                new_instance = StartInstance(session)
                nova = new_instance.start_instance(server_name=device_id.get("id"), image="cirros", size="m1.small",
                                                   userdata="")
            elif 'router' in device_id.get("image"):
                print(device_id.get("id"))
                new_router = CreateRouter(session)
                body = {'name': device_id.get("id")}
                neutron = new_router.create_router(body)
            elif 'apache' in device_id.get("image"):
                print(device_id.get("id"))
                new_instance = StartInstance(session)
                #Couldn't get relative directory to work, need to look at this again
                cloud_init = open(PROJECT_PATH + '/CloudInit/apache_cloudinit.txt')
                nova = new_instance.start_instance(server_name=device_id.get("id"), image="Ubuntu 16.04 LTS",
                                                   size="m1.small", userdata=cloud_init)
            elif 'network' in device_id.get("image"):
                print(device_id.get("image"))
                new_network = CreateNetwork(session)
                body = {'name': device_id.get("id"),'admin_state_up': True}
                neutron = new_network.create_network(body)
            else:
                print("Only VM creation is currently supported")
        return HttpResponse("OK")
