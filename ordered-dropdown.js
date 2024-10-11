VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["VSS/Service", "TFS/WorkItemTracking/Services", "TFS/WorkItemTracking/RestClient"],
    function (VSS_Service, TFS_Wit_Services, TFS_Wit_WebApi) {
        
    var witService = VSS_Service.getCollectionService(TFS_Wit_Services.WorkItemFormService);
    var witClient = VSS_Service.getClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);

    var fieldName = "";
    var customOrder = [];

    // Load the custom order from somewhere (e.g., a work item field or extension data storage)
    function loadCustomOrder() {
        // For this example, we'll use a hardcoded order
        customOrder = ["High", "Medium", "Low"];
    }

    function updateDropdown(values) {
        var dropdown = document.getElementById("orderedDropdown");
        dropdown.innerHTML = "";

        customOrder.forEach(function(item) {
            if (values.indexOf(item) !== -1) {
                var option = document.createElement("option");
                option.text = item;
                option.value = item;
                dropdown.add(option);
            }
        });

        // Add any remaining values that aren't in the custom order
        values.forEach(function(item) {
            if (customOrder.indexOf(item) === -1) {
                var option = document.createElement("option");
                option.text = item;
                option.value = item;
                dropdown.add(option);
            }
        });
    }

    function load() {
        return witService.getFieldValue(fieldName).then(function (value) {
            loadCustomOrder();
            witClient.getWorkItemFields().then(function(fields) {
                var field = fields.find(f => f.name === fieldName);
                if (field && field.allowedValues) {
                    updateDropdown(field.allowedValues);
                }
            });
            if (value) {
                document.getElementById("orderedDropdown").value = value;
            }
        });
    }

    function save() {
        var value = document.getElementById("orderedDropdown").value;
        return witService.setFieldValue(fieldName, value);
    }

    VSS.register("ordered-dropdown-control", {
        onLoaded: function (params) {
            fieldName = params.inputs.FieldName;
            load();
        },
        onSave: save
    });

    VSS.notifyLoadSucceeded();
});