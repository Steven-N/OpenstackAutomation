from neutronclient.v2_0 import client as neutron_client


class Utils(object):

    def __init__(self, session):
        self.session = session

    def get_network_list(self):
        neutron = neutron_client.Client(session=self.session)
        networks = neutron.list_networks(retrieve_all=True)['networks']
        network_list = []
        for network in networks:
            network_list.append(network['name'])
        return network_list

    @staticmethod
    def find_group(nodes, group_name):
        group_nodes = []
        for node in nodes:
            if node.get("group") == group_name:
                group_nodes.append(node)
        print("GROUP NODES ARE: " + str(group_nodes))
        return group_nodes
