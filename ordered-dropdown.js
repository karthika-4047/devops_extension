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

        function loadCustomOrder() {
            var customOrderInput = document.getElementById("customOrderInput");
            if (customOrderInput) {
                var customOrderValue = customOrderInput.value;
                customOrder = customOrderValue.split(";").map(item => item.trim()).filter(item => item); // Ensure no empty items
            }
        }

        function updateDropdown(values) {
            var dropdown = document.getElementById("orderedDropdown");
            dropdown.innerHTML = ""; // Clear previous options

            // Add custom ordered items first
            customOrder.forEach(function(item) {
                if (values.indexOf(item) !== -1) {
                    var option = document.createElement("option");
                    option.text = item;
                    option.value = item;
                    dropdown.add(option);
                }
            });

            // Add remaining items that are not in custom order
            values.forEach(function(item) {
                if (customOrder.indexOf(item) === -1) {
                    var option = document.createElement("option");
                    option.text = item;
                    option.value = item;
                    dropdown.add(option);
                }
            });

            // Optional: Show a message if no items are available
            if (dropdown.options.length === 0) {
                var option = document.createElement("option");
                option.text = "No options available";
                option.disabled = true;
                dropdown.add(option);
            }
        }

        function load() {
            return witService.getFieldValue(fieldName).then(function (value) {
                loadCustomOrder();
                return witClient.getWorkItemFields().then(function(fields) {
                    var field = fields.find(f => f.name === fieldName);
                    if (field && field.allowedValues) {
                        updateDropdown(field.allowedValues);
                    } else {
                        console.error("Field not found or has no allowed values.");
                    }
                });
            }).catch(function(error) {
                console.error("Error loading field value:", error);
            }).then(function() {
                if (value) {
                    document.getElementById("orderedDropdown").value = value;
                }
            });
        }

        function save() {
            var value = document.getElementById("orderedDropdown").value;
            return witService.setFieldValue(fieldName, value).catch(function(error) {
                console.error("Error saving field value:", error);
            });
        }

        VSS.register("ordered-dropdown-control", {
            onLoaded: function (params) {
                fieldName = params.inputs.FieldName; // Assuming you get this from the options
                load();
            },
            onSave: save
        });

        VSS.notifyLoadSucceeded();
    });
