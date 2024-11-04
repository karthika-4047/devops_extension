// ordered-dropdown.js
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
        var allowedValues = [];

        function parseCustomOrder(orderString) {
            if (!orderString) return [];
            return orderString.split(',')
                .map(item => item.trim())
                .filter(item => item && allowedValues.includes(item));
        }

        function updateDropdown() {
            var dropdown = document.getElementById("orderedDropdown");
            if (!dropdown) return;
            
            dropdown.innerHTML = ""; // Clear previous options

            // Add empty option if needed
            var emptyOption = document.createElement("option");
            emptyOption.text = "-- Select a value --";
            emptyOption.value = "";
            dropdown.add(emptyOption);

            // Add items in custom order first
            customOrder.forEach(function(item) {
                if (allowedValues.includes(item)) {
                    var option = document.createElement("option");
                    option.text = item;
                    option.value = item;
                    dropdown.add(option);
                }
            });

            // Add remaining allowed values that aren't in custom order
            allowedValues.forEach(function(item) {
                if (!customOrder.includes(item)) {
                    var option = document.createElement("option");
                    option.text = item;
                    option.value = item;
                    dropdown.add(option);
                }
            });
        }

        function load(params) {
            if (!params || !params.inputs) return;

            fieldName = params.inputs.FieldName;
            var orderConfig = params.inputs.Values || "";
            
            return witService.getFieldValue(fieldName)
                .then(function (value) {
                    return witClient.getWorkItemFields();
                })
                .then(function(fields) {
                    var field = fields.find(f => f.name === fieldName);
                    if (field && field.allowedValues) {
                        allowedValues = field.allowedValues;
                        customOrder = parseCustomOrder(orderConfig);
                        updateDropdown();
                        
                        // Set initial value if it exists
                        if (value) {
                            var dropdown = document.getElementById("orderedDropdown");
                            dropdown.value = value;
                        }
                    }
                })
                .catch(function(error) {
                    console.error("Error loading field configuration:", error);
                });
        }

        function save() {
            var dropdown = document.getElementById("orderedDropdown");
            if (!dropdown) return;
            
            var value = dropdown.value;
            return witService.setFieldValue(fieldName, value)
                .catch(function(error) {
                    console.error("Error saving field value:", error);
                });
        }

        VSS.register("ordered-dropdown-control", {
            onLoaded: function (params) {
                load(params);
            },
            onFieldChanged: function(args) {
                if (args.fieldName === fieldName) {
                    var dropdown = document.getElementById("orderedDropdown");
                    if (dropdown && args.value !== dropdown.value) {
                        dropdown.value = args.value || "";
                    }
                }
            },
            onSave: save
        });

        VSS.notifyLoadSucceeded();
    });