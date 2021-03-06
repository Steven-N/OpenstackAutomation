var nodes, edges, networkName
var nodeDataFromPage, edgeDataFromPage, newNodeFromPage, newEdgeFromPage;
var nodeContents = new Array(0);
var edgeContents = new Array(0);
var newNodeContents  = new Array(0);
var newEdgeContents = new Array(0);
var selectedDevice;
var selectedAppName;
var sizeOfApplicationObj;
var removedNodes = [];
var deployedNodesAndEdges, removedNodesAndEdges = {};
var firstSelected = [];
var secondSelected = [];
var nodeIDsInModal = [];
var sortableListNames = "";
var totalVMFields = 1;
        // convenience method to stringify a JSON object
        function toJSON(obj) {
            return JSON.stringify(obj, null, 4);
        }
        
        //On click of node or edge fields on page.
        $(document).ready(function(){
            $('#nodes, #edges').on('click', function(e){
                nodeDataFromPage = $('#nodes').html();
                edgeDataFromPage = $('#edges').html();
                //JSON.parse Converts to JS object.
                if(nodeDataFromPage.length > 0){
                    nodeContents = JSON.parse(nodeDataFromPage);
                }
                if(edgeDataFromPage.length > 0){
                    edgeContents = JSON.parse(edgeDataFromPage);
                }
                console.log($('#nodes, #edges').html());
                return false;
            });
        });
        
        //On blur (click out of field) on the node or edges on the page.
        $(document).ready(function(){
            $('#nodes, #edges').on('blur', function(e){
                console.log($('#nodes, #edges').html());
                newNodeFromPage = $('#nodes').html();
                newEdgeFromPage = $('#edges').html();
                //JSON.parse converts to JS object.
                if(newNodeFromPage.length > 0){
                    newNodeContents = JSON.parse(newNodeFromPage);
                }
                
                if(newEdgeFromPage.length > 0){
                    newEdgeContents = JSON.parse(newEdgeFromPage);
                }
                
                //If node has been removed.
                if (newNodeContents.length < nodeContents.length){
                    var copyOfNodes = JSON.parse(JSON.stringify(nodeContents));
                    for (var i=0; i<newNodeContents.length; i++){
                        for (var j=0; j<copyOfNodes.length;j++){
                            if (newNodeContents[i]["id"] == copyOfNodes[j]["id"]){
                                copyOfNodes.splice(j,1);
                            }
                        }
                    }
                    for (var i=0; i<copyOfNodes.length;i++){
                        for (var j=0; j<newEdgeContents.length;j++){
                            if(newEdgeContents[j]["from"] == copyOfNodes[i]["id"]){
                                edges.remove(newEdgeContents[j]);
                             }else if(newEdgeContents[j]["to"] == copyOfNodes[i]["id"]){
                                 edges.remove(newEdgeContents[j]);
                             }
                        }
                        nodes.remove(copyOfNodes[i]);
                       }
                }
                
                //If edge has been removed.
                if (newEdgeContents.length < edgeContents.length){
                    var copyOfEdges = JSON.parse(JSON.stringify(edgeContents));
                    for (var i=0; i<newEdgeContents.length; i++){
                        for (var j=0; j<copyOfEdges.length;j++){
                            if (newEdgeContents[i]["id"] == copyOfEdges[j]["id"]){
                                copyOfEdges.splice(j,1);
                            }
                        }
                    }
                    for (var i=0; i < copyOfEdges.length; i++){
                        edges.remove(copyOfEdges[i]);
                    }
                }
                // If edge has been added.
                if (newNodeContents.length > nodeContents.length){
                    var copyOfNodes = JSON.parse(JSON.stringify(nodeContents));
                    for (var i=0; i<newNodeContents.length;i++){
                        for (var j=0; j<copyOfNodes.length;j++){
                            if (newNodeContents[i]["id"] == copyOfNodes[j]["id"]){
                                copyOfNodes.splice(j,1);
                            }
                        }
                    }
                    for (var i=0; i<copyOfNodes.length;i++){
                        nodes.add(copyOfNodes[i]);
                    }
                }
                //If updates to any names have been made.
                if(!_.isEqual(nodeContents, newNodeContents)){
                    for(var i=0; i<newNodeContents.length;i++){
                        nodes.update(newNodeContents[i]);
                    }
                }
                if(!_.isEqual(edgeContents, newEdgeContents)){
                    for(var i=0; i<newNodeContents.length;i++){
                        edges.update(newEdgeContents[i]);
                    }
                }
            });
        }); //End of blur - clicking off editable fields.

        // If plus or minus button is clicked in the VM Modal. Increase/Decrease the number in the text box. Ensure it falls within the set limits and update the number of Jquery sortable fields.
            $('.input-number').focusin(function(){
        $( document ).ready(function() {
            $('.btn-number').click(function(e){
                e.preventDefault();
        
                var fieldName = $(this).attr('data-field');
                var buttonPressed = $(this).attr('data-type');
                var input = $("input[name='"+fieldName+"']");
                var currentVal = parseInt(input.val());
                if (!isNaN(currentVal)) {
                    if(buttonPressed == 'minus') {
                        var minValue = parseInt(input.attr('min')); 
                        if(!minValue){
                            maxValue = 9;
                        }
                        if(currentVal > minValue) {
                            input.val(currentVal - 1).change();
                        } 
                        if(parseInt(input.val()) == minValue) {
                            $(this).attr('disabled', true);
                        }
                        createAdditionalVMField(currentVal - 1);
                        
                    } else if(buttonPressed == 'plus') {
                        var maxValue = parseInt(input.attr('max'));
                        if(!maxValue){
                            maxValue = 9;
                        }
                        if(currentVal < maxValue) {
                            input.val(currentVal + 1).change();
                        }
                        if(parseInt(input.val()) == maxValue) {
                            $(this).attr('disabled', true);
                        }
                        createAdditionalVMField(currentVal + 1);
                    }
                } else {
                    input.val(0);
                }
            });
            
            // If the text box number is changed on the new VM Modal, ensure it falls within the set limits and update the number of Jquery sortable fields.
            $('.input-number').focusin(function(){
               $(this).data('oldValue', $(this).val());
            });
            $('.input-number').change(function() {
                
                var minValue =  parseInt($(this).attr('min'));
                var maxValue =  parseInt($(this).attr('max'));
                if(!minValue){
                    minValue = 1;
                }
                
                if(!maxValue){
                    maxValue = 9;
                }
                var currentValue = parseInt($(this).val());
                
                var name = $(this).attr('name');
                if(currentValue >= minValue) {
                    $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
                } else {
                    alert('Sorry, the minimum value was reached');
                    $(this).val($(this).data('oldValue'));
                }
                if(currentValue <= maxValue) {
                    $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
                } else {
                    alert('Sorry, the maximum value was reached');
                    $(this).val($(this).data('oldValue'));
                }
                createAdditionalVMField(currentValue);
            });
        });
        
        // Removes last child ID from a given parent ID.
        function removeChild(parentID, childID){
            var parent = document.getElementById(parentID);
            var lastChild = parent.lastChild;
            parent.removeChild(lastChild);
        }
        
        // Called with either the plus/minus button is clicked or a new number is typed into the text box. Creates a new JQuery sortable container.
        function createAdditionalVMField(currentVal){
            html = "";
            if (currentVal > totalVMFields){
                newTotalVMs = currentVal;
                for (var i=totalVMFields; i < newTotalVMs; i++){
                    document.getElementById('newAppList').innerHTML += '<label><ul id="VM'+i+'"'+'class ="connectedSortable">'+ 'VM'+i+'</label></ul>'
                    //e.preventDefault();
                    sortableListNames += ',#VM'+i
                }
            }else{
                newTotalVMs = currentVal;
                for (var i=totalVMFields; i>currentVal; i--){
                    if((document.getElementById('VM' + (i-1)).childNodes) > 0){
                        alert("Remove all nodes from VM" + (i-1) + "before continuing.")
                    }
                    removeChild('newAppList','VM'+(i-1));
                    sortableListNames.replace(',#VM'+(i-1),'');
                }
            }
            $( function() {
                $(sortableListNames).sortable({
                  placeholder: "ui-state-highlight",
                  connectWith: ".connectedSortable"
                }).disableSelection();
            });
            totalVMFields = newTotalVMs;
        }
        
        // Drag and drop sortable list. Used to select different VMs for each application.
        function addApplications(applicationRequirements){
            sortableListNames = '#VM0';
            var appID = parseInt($('input[name=appName]:checked', '.applicationNameForm')[0].id);
            selectedAppName = $('input[name=appName]:checked', '.applicationNameForm')[0].value;
            var applicationRequirements = applicationRequirements[appID];
            htmlInitData = '<label><ul id="VM0" class ="connectedSortable">VM0</label>'
            $('#newAppList').append(htmlInitData);
            htmlInitData = "";
            for (var i=0; i<applicationRequirements.length; i++){
                htmlInitData += '<li class="ui-state-default" value="' + applicationRequirements[i] + '">'+applicationRequirements[i]+'</li>'
            }
            htmlInitData += '</ul>'
            $("h4.modal-title").text(selectedAppName)
            $('#newAppList #VM0').append(htmlInitData)        
            $( function() {
                $(sortableListNames).sortable({
                  placeholder: "ui-state-highlight",
                  connectWith: ".connectedSortable"
                }).disableSelection();
            });
            
            $("#Select-Application-VMs-Modal").modal({backdrop: 'static', keyboard: false});
            $('input[name="appName"]').prop('checked', false);
        }
        
        // Gets the JQuery Sortable containers and updates the network topology by adding the new VMs to it.
        function saveSelectedAppList(){
            var dataInListObj = {}
            var sortableLists = sortableListNames.replace('#appList,','')
            sortableLists = sortableLists.split(',')
            sizeOfApplicationObj = 0
            for (var i=0; i<sortableLists.length; i++){
                var sortableListData = $("#newAppList " + sortableLists[i].replace(',',''));
                var data = sortableListData[0]["children"]
                for (var j=0; j<data.length;j++){
                    if (j == 0){
                        dataInListObj[sortableLists[i].replace('#','')] = [];
                        sizeOfApplicationObj++;
                    }
                    dataInListObj[sortableLists[i].replace('#','')].push(data[j].textContent);
                }
            }
            var groupName = $("#vmGroupName input:text")[0].value
            
            for (var property in dataInListObj){
                if (dataInListObj.hasOwnProperty(property)){
                    nodes.add({
                        id: groupName+"-"+property,
                        type: "vm",
                        deployed: "false",
                        label: groupName+"-"+property,
                        image: "/static/images/vm.png",
                        shape: "image",
                        group: groupName,
                        application: selectedAppName,
                        numVMs: sizeOfApplicationObj,
                        requirements: toJSON(dataInListObj[property])
                    });
                }
            }
            resetSortable();
        }
        
        // Removes the JQuery sortable containers from the Modal. Called when the modal is closed/exited.
        function resetSortable(){
            $('#newAppList #appList').html('');
            $('#newAppList').html('');
        }
        
        // Clears a modal of any entered text or selected checkboxes/radio buttons.
        function destroyModal(modalID){
            $('#'+ modalID).on('hidden.bs.modal', function (e) {
              $(this)
                .find("input, textarea, select")
                   .val('')
                   .end()
                .find("input[type=checkbox], input[type=radio]")
                   .prop("checked", "")
                   .end();
            })
        }
        
        // Called when the new application modal is saved. Sends an AJAX message to the backend with our JSON to keep track of applications and their requirements (i.e. LAMP requires Apache and MYSQL).
        function addNewApplication(){
            var newNetworkData = [];
            $(".newApplicationForm input:text").each(function(){
                newNetworkData.push($(this).val());
            });
            var selectedOS = $('input[name=chosenOS]:checked', '#newApplicationForm')[0].id
            newNetworkData.push(selectedOS)
            var submit = true;
            var networkName = $('#applicationName');
            var networkReqs = $('#applicationRequirements');
            var imageFile = $('#applicationImage');
            
            if (newNetworkData[0].length == 0){
                networkName.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }else if(newNetworkData[1].length == 0){
                networkReqs.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }
            
            if(submit){
                $.ajax({
                    csrfmiddlewaretoken: '{{ csrf_token }}',
                    method: 'POST',
                    url: '/Home/NetworkTopology/',
                    dataType: 'json',
                    data: "[{'action': 'add_application'}," + "[{'application_info':" + "'" + JSON.stringify(newNetworkData) + "'" + "}]]"
                });
            }
            destroyModal('newApplicationModal');
        }
        
        // Called when the save button is selected in the remove application modal. Used to delete an application from the database. Sends a JSON string using AJAX which tells our backend to remove the selected application.
        function removeApplication(){
            var appToRemove = $("#applicationRemoval option:selected").text();
            $.ajax({
                csrfmiddlewaretoken: '{{ csrf_token }}',
                method: 'POST',
                url: '/Home/NetworkTopology/',
                dataType: 'json',
                data: "[{'action': 'remove_application'}," + "[{'application_info':" + "'" + JSON.stringify(appToRemove) + "'" + "}]]"
            });
            destroyModal('removeApplicationModal');
        }
        
        
        //Add selected networks to an array. Pass it to the addNetwork() function to be added to the topology.
        function updateNetwork(){
            var selectedNetworks = [];
            $(".networkNameForm input:checked").each(function(){
               selectedNetworks.push($(this).val());
               document.getElementById($(this).val()).disabled = true;
            });
            addNetwork(selectedNetworks);
        }
        
        // Creates a new router in the topology. Called when the save button is selected from the router modal.
        function addNewRouter(){
            var routerID = [];
            $(".newRouterForm input:text").each(function(){
                routerID.push($(this).val());
            });
            var submit = true;
            var routerName = $("#RouterName");
            
            if(!routerID[0]){
                routerName.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }
            if(submit){
                try{
                nodes.add({
                    id: routerID[0],
                    type: "router",
                    deployed: "false",
                    label: routerID[0],
                    image: "/static/images/router.png",
                    shape: "image"
                });
                    $("#myRouterIDModal").modal('hide');
                }   
                catch(err){
                    alert(err);
                }   
            }
        }
        
        // Called when the 'New Network' radio button is selected by the user. Opens a new modal form to ask the user for additional input (IP address, DHCP range, Network Name).
        function addNewNetwork(){
            var newNetworkData = [];
            $(".newNetworkForm input:text").each(function(){
                newNetworkData.push($(this).val());
            });
            var submit = true;
            var subnetName = $('#SubnetName');
            var subnetAddr = $('#IPAddress');
            var dhcp_s = $('#poolStart');
            var dhcp_e = $('#poolEnd');
            
            // Data validation.
            if (!newNetworkData[0]){
                subnetName.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }else{
                subnetName.closest('.form-group').removeClass('has-error').addClass('has-success');
            }
            
            if(!newNetworkData[1]){
                subnetAddr.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }else if(!validateIPAddressWithCIDR(newNetworkData[1])){
                subnetAddr.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }else{
                subnetAddr.closest('.form-group').removeClass('has-error').addClass('has-success');
            }
            
            if(!newNetworkData[2]){
                dhcp_s.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }else if(!validateIPAddressWithoutCIDR(newNetworkData[2])){
                dhcp_s.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }else{
                dhcp_s.closest('.form-group').removeClass('has-error').addClass('has-success');
            }
            
            if(!newNetworkData[3]){
                dhcp_e.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }else if(!validateIPAddressWithoutCIDR(newNetworkData[3])){
                dhcp_e.closest('.form-group').removeClass('has-success').addClass('has-error');
                submit = false;
            }else{
                dhcp_e.closest('.form-group').removeClass('has-error').addClass('has-success');
            }
            
            // If all modal fields have been properly filled in, add the new network to the topology.
            if(submit){
                try{
                    nodes.add({
                        id: newNetworkData[0],
                        type: "network",
                        deployed: "false",
                        label: newNetworkData[0],
                        image: "/static/images/network.png",
                        shape: "image",
                        subnetName: newNetworkData[0],
                        subnet: newNetworkData[1],
                        dhcp_start: newNetworkData[2],
                        dhcp_end: newNetworkData[3]
                    });
                    $("#newNetworkModal").modal('hide');
                }   
                catch(err){
                    alert(err);
                }   
            }
        }
        
        // Data validation used in the addNewNetwork function. Verifies that an IP address is valid with a CIDR value at the end (i.e. 192.168.1.0/24 is valid. 192.168.257.0/24 is not valid).
        function validateIPAddressWithCIDR(ipaddress){  
            if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[1-2]?[0-9])$/.test(ipaddress)){  
                return (true)  
            }
            return false;
        }
        // Data validation used in the addNewNetwork function. Verifies that an IP address is valid without a CIDR value. (i.e. 192.168.1.0 is valid. 192.168.1.0/24 is not valid).
        function validateIPAddressWithoutCIDR(ipaddress){
            if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)){  
                return (true)  
            }
            return false;
        }
        
        // Called when a user selects an already existing network from the network modal to add it to the topology. Accepts a list of networks (selected from checkboxes) and adds them all to the topology.
        function addNetwork(networkList){
            try {
                for(var i=0; i<networkList.length; i++){
                    if (networkList[i] === "newNetwork"){
                        $("#newNetworkModal").modal();
                    }else{
                        nodes.add({
                            id: networkList[i],
                            type: "network",
                            //deployed: "false",
                            label: networkList[i],
                            image: "/static/images/network.png",
                            shape: "image",
                            subnetName: "",
                            subnet: "",
                            dhcp_start: "",
                            dhcp_end: ""
                        });
                    }
                }
            }
            catch(err){
                alert(err);
            }
            destroyModal("myNetworkModal");
            destroyModal("newNetworkModal");
        }
        
        // Used to add all nodes in the topology to the 'remove from network' modal. Adds a checkbox for each node in the modal and a user can select which nodes to remove.
        function removeNodeFromTopology(){
            var removeNodes = nodes.get();
            var addToModal = [];
            // nodeIDsInModal is a global variable. Stores all nodes in the topology.
            for (var i=0; i<removeNodes.length;i++){
                addToModal.push(removeNodes[i]["id"]);
                nodeIDsInModal.push(removeNodes[i]["id"]);
            }
            // Creates the HTML string to add into the modal.
            html = "";
            html += '<ul>'
            for (var i = 0; i < addToModal.length; i++){
                html += '<li><label><input type="checkbox" id="' + addToModal[i] + '" value="' + addToModal[i] + '">' + addToModal[i] + '</label></li>';
            }
            html += '</ul>';
            $('#removeNode').html(html);
            $("#removeFromNetwork").modal({backdrop: 'static', keyboard: false});
        }
        
        // Removes the node from the nodeIDsInModal which was removed from the topology.
        function removeNodeIDsFromArray(removedNodeArray, removedNode){
            for (var i=0;i<removedNodeArray.length;i++){
                index = removedNodeArray.indexOf(removedNode);
                removedNodeArray.splice(index,1);
            }
        }
        
        // Used to remove nodes and connections from the topology. Also updates the removedNodes array which is used to teardown (remove) instances which were deployed from OpenStack. 
        function removeNode() {
            var checkedRemovedNodes = [];
            $(".removeNodeFromNetwork input:checked").each(function(){
               checkedRemovedNodes.push($(this).val()); 
            });
            try {
                /* Checks if the node we are removing is both deployed and a VM. This ensures that we do not accidentally remove a network or router from OpenStack. If it is, add it to an array which will be used if the
                user selected the tear down button from our web application.*/
                for (var i=0; i<checkedRemovedNodes.length; i++){
                    if((nodes._data[checkedRemovedNodes[i]]["deployed"] = true) && nodes._data[checkedRemovedNodes[i]]["type"] == 'vm'){
                        removedNodes.push(checkedRemovedNodes[i])
                    }
                    // Removes the node from the topology. Also removes this node from our global array holding all nodes in the topology.
                    nodes.remove({id: checkedRemovedNodes[i]});
                    removeNodeIDsFromArray(nodeIDsInModal,checkedRemovedNodes[i]);
                    // Removes edges that are left behind by the removed nodes.
                    for (var property in edges._data){
                        if (edges._data[property]["to"] == checkedRemovedNodes[i]){
                            edges.remove({id: edges._data[property]["id"]})
                        }else if (edges._data[property]["from"] == checkedRemovedNodes[i]){
                            edges.remove({id: edges._data[property]["id"]})
                        }
                    }
                }
            }
            catch (err) {
                alert(err);
            }
        }
        
        // Called when a user clicks on 'Deploy'.
        function deploy(){
            // Stores all nodes and connections in an object.
            deployedNodesAndEdges = {
                nodes: JSON.stringify(nodes.get(),null,4),
                edges: JSON.stringify(edges.get(),null,4)  
            }
            /* If there are no nodes or no edges, warn the user and exit the function. A node must have a connection before it can be deployed. Nodes can only be connected to networks. This ensures that no
            nodes are deployed to OpenStack without an accompanying network as they will no function if they are not connected to a network.*/
            if ((nodes.get().length) == 0 || (edges.get().length == 0)){
                $.alert("There must be nodes and edges in the topology before deploying to OpenStack.");
                return;
            }
            // Display a confirmation box to the user before sending the AJAX message to the backend.
            $.confirm({
                title: 'Confirm Deployment',
                content: 'Topology will be deployed on OpenStack',
                closeIcon: true,
                buttons: {
                    confirm: {
                        btnClass: 'btn-green',
                        action: function () {
                            // Sends the AJAX message to the backend.
                            $.ajax({
                                csrfmiddlewaretoken: '{{ csrf_token }}',
                                method: 'POST',
                                url: '/Home/NetworkTopology/',
                                dataType: 'json',
                                data: "[{'type': 'deploy'}," + deployedNodesAndEdges["nodes"] + "," + deployedNodesAndEdges["edges"] + "]",
                                success: function(data){
                                    var deployed_status = data;
                                    for (var property in nodes._data){
                                        nodes._data[property]["deployed"] = "true"
                                    }
                                }
                            });
                        },
                    },
                    cancel: {
                        btnClass: 'btn-red',
                        action: function () {
                            $.alert('Canceled Deployment.');
                        }
                    }
                }
            });
        }
        
        // Used to save the current topology to the database.
        function saveTopology(){
            // Stores all nodes and edges in an object.
            topology = {
                nodes: JSON.stringify(nodes.get(), null, 4),
                edges: JSON.stringify(edges.get(), null, 4)
            }
            // Ensures nodes and edges exist in the network topology.
            if ((nodes.get().length) == 0 || (edges.get().length == 0)){
                $.alert("There must be nodes and edges in the topology before saving it.");
                return;
            }
            var newTopologyName = [];
            $(".newTopologyForm input:text").each(function(){
                newTopologyName.push($(this).val());
            });
            // Sends the AJAX message to the backend.
            $.ajax({
                csrfmiddlewaretoken: '{{ csrf_token }}',
                method: 'POST',
                url: '/Home/NetworkTopology/',
                dataType: 'json',
                data: "[{'action': 'save_template','topology_name': " + "'" + newTopologyName[0] + "'}," + topology["nodes"] + "," + topology["edges"] + "]"
            })
        }
        
        // Loads a topology from a database which is selected in a dropdown menu to the user. 
        function returnTopology(){
            // This will be changed to accept user input later.
            var returnedNodes = [];
            var returnedEdges = [];
            var e = document.getElementById("top_name_retrieve");
            var topology_name = e.options[e.selectedIndex].text;
            // Confirmation field before continuing with the database call.
            $.confirm({
                title: 'Retrieve Topology',
                content: 'The topology named' + topology_name + ' will be retrieved and placed into your Network.',
                closeIcon: true,
                buttons: {
                    confirm: {
                        btnClass: 'btn-green',
                        action: function () {
                            $.ajax({
                                csrfmiddlewaretoken: '{{ csrf_token }}',
                                method: 'POST',
                                url: '/Home/NetworkTopology/',
                                dataType: 'json',
                                data: "[{'action': 'return_topology'}," + "[{'topology_name':" + "'" + topology_name + "'" + "}]]",
                            
                                success: function(data){
                                    var returnedTopology = data;
                                    returnedNodes = returnedTopology[0];
                                    returnedEdges = returnedTopology[1];
                                    addTopology(returnedNodes, returnedEdges);
                                }
                            });
                        },
                    },
                    cancel: {
                        btnClass: 'btn-red',
                        action: function () {return;}
                    }
                }
            });
        }
        
        // Delete a template from the database.
        function deleteTemplate(){
            var e = document.getElementById("top_name_retrieve");
            var topology_name = e.options[e.selectedIndex].text;
            $.confirm({
                title: 'Delete Topology',
                content: 'The topology named' + topology_name + ' will be permanently deleted from the database.',
                closeIcon: true,
                buttons: {
                    confirm: {
                        btnClass: 'btn-green',
                        action: function () {
                            $.ajax({
                                csrfmiddlewaretoken: '{{ csrf_token }}',
                                method: 'POST',
                                url: '/Home/NetworkTopology/',
                                dataType: 'json',
                                data: "[{'action': 'delete_template'}," + "[{'topology_name':" + "'" + topology_name + "'" + "}]]",
                            });
                        },
                    },
                    cancel: {
                        btnClass: 'btn-red',
                        action: function () {return;}
                    }
                }
            });

        }
        
        // Adds the topology returned from the database to the network topology.
        function addTopology(returnedNodes, returnedEdges){
            if (returnedNodes.length > 0){
                for (var i = 0; i < returnedNodes.length; ++i){
                    nodes.add(returnedNodes[i]);
                }
            }
            if (returnedEdges.length > 0){
                for (var i = 0; i < returnedEdges.length; ++i){
                    edges.add(returnedEdges[i]);
                }
            }
        }
        
        // Used to remove instances (VMs) from OpenStack. 
        function tearDown(){
              // removedNodes is a global variable which is an array. It is populated when a user removes VMs from the topology that are deployed.
              if(removedNodes.length > 0){
                  $.confirm({
                    title: 'Confirm Teardown',
                    content: 'Topology will be removed from OpenStack',
                    closeIcon: true,
                    buttons: {
                        confirm: {
                            btnClass: 'btn-green',
                            action: function () {
                                $.ajax({
                                        csrfmiddlewaretoken: '{{ csrf_token }}',
                                        method: 'POST',
                                        url: '/Home/NetworkTopology/',
                                        dataType: 'json',
                                        data: "[{'action': 'teardown'}," + "[{'removed_nodes':" + "'" + JSON.stringify(removedNodes) + "'" + "}]]",
                                        success: function(data){
                                            removedNodes = [];
                                        }
                                });
                            },
                        },
                        cancel: {
                            btnClass: 'btn-red',
                            action: function () {
                                $.alert('Canceled Teardown.');
                            }
                        }
                    }
                });
              }else{
                $.alert("Nodes must be removed from the topology before you can remove them from OpenStack.")
              }
        }

        // Used to add a connection between two nodes.
        function addEdge(nodeID, firstNode, secondNode) {
            try {
                edges.add({
                    id: nodeID,
                    from: firstNode,
                    to: secondNode
                });
              }
            catch (err) {
                alert(err);
            }
        }
        
        // Main draw function. Initialises all of the necessary global variables which are used elsewhere to add/remove nodes & edges from the topology.
        function draw() {
            // create an array with nodes
            nodes = new vis.DataSet();
            // Reads the JSON from the pre-formatted nodes field.
            nodes.on('*', function () {
                document.getElementById('nodes').innerHTML = JSON.stringify(nodes.get(), undefined, 4);
            });

            // create an array with edges
            edges = new vis.DataSet();
            // Reads the JSON from the pre-formatted edges field.
            edges.on('*', function () {
                document.getElementById('edges').innerHTML = JSON.stringify(edges.get(), null, 4);
            });

            // create a network
            var container = document.getElementById('network');
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {interaction:{
                                hover:true,
                                selectable:true
            }};
            
            // Create the network.
            network = new vis.Network(container, data, options);
            network.setOptions(options);
            network.on('selectNode', function(p) {
                // If no nodes have been selected yet.
                if(firstSelected.length == 0){
                    firstSelected = network.getSelectedNodes();
                // If one node has already been selected.
                }else{
                    secondSelected = network.getSelectedNodes();
                }
                // If two nodes have been selected.
                if(firstSelected.length == 1 && secondSelected.length == 1){
                        var linkCreated = false;
                        upperLoop:
                        for (var property in nodes._data){
                            // If the first node selected is a network and the second is not a network.
                            if (nodes._data[property]["id"] == firstSelected[0] && nodes._data[property]["type"] == "network"){
                                for (var property in nodes._data){
                                    if(nodes._data[property]["id"] == secondSelected[0] && nodes._data[property]["type"] != "network"){
                                        var nodeID = firstSelected + "-" + secondSelected;
                                        addEdge(nodeID,firstSelected[0],secondSelected[0]);
                                        firstSelected = [];
                                        secondSelected = [];
                                        linkCreated = true;
                                        break upperLoop;
                                    }
                                }
                            // If the first node selected is not a network and the second node selected is a network.
                            }else if (nodes._data[property]["id"] == firstSelected[0] && nodes._data[property]["type"] != "network"){
                                for (var property in nodes._data){
                                    if(nodes._data[property]["id"] == secondSelected[0] && nodes._data[property]["type"] == "network"){
                                        var nodeID = firstSelected + "-" + secondSelected;
                                        addEdge(nodeID,firstSelected[0],secondSelected[0]);
                                        firstSelected = [];
                                        secondSelected = [];
                                        linkCreated = true;
                                        break upperLoop;
                                    }
                                }
                            }
                        }
                    // If the link was not created, empty the selected arrays and alert the user that an error was made.
                    if (!linkCreated){
                        firstSelected = [];
                        secondSelected = [];
                        alert("Only one of the two nodes you are connecting should be a network.");
                    }
                };
            });
        }