/**
 * Created by Daniel Schulz on 21.08.2015.
 *
 * The Backbone view for the Minventar.
 */
var MinventarView = Backbone.View.extend({

        /**
         * All resource types
         */
        resourceTypes: {},

        /**
         * All resources
         */
        resources: {},

        /**
         * True if this view is in type mode, false if it is in resource mode
         */
        isTypeMode: false,

        /**
         * True if the dialog for creating or editing a resource is open
         */
        isCreationDialogOpen: false,

        /**
         * Object containing all the events this view liestens to
         */
        events: {
            "click #creation-button": "showCreationDialog",
            "click #resources-types-radio": "switchToTypeMode",
            "click #resources-radio": "switchToResourceMode",

            "submit #type-creation-form": "createType",
            "submit #resource-creation-form": "createResource",
            "click #cancel-btn": "cancelCreation",
            "click #add-attr": "addAttributeToCreation",
            "click #rmv-attr": "removeAttributeFromCreation",
            "change #input-type": "definedType",
            "click #add-resource": "addResourceToBundle",
            "click #rmv-resource": "removeResourceFromBundle",

            "submit #filter-form": "filter",
            "click #filter-reset-btn": "resetFilter",
            "click #edit-type-btn": "editType",
            "click #save-btn": "save",
            "click  #delete-btn": "delete",
            "click #edit-resource-btn": "editResourceEvent",
            "click #parent-btn": "editParent"
        },

        /**
         * Initializes this view setting it to resource mode.
         */
        initialize: function () {
            console.log("initializing minventar");

            var that = this;

            this.resourceTypes = new ResourceTypes();
            this.resources = new Resources();
            this.resourceTypes.fetch().always(function () {
                success:  that.resources.fetch().always(function () {
                    success:  that.showResources(that.resources.models);
                });
            });

            this.showResourceFilter();
            // for firefox compatibility
            $("#resources-radio").prop('checked', true);
        },

        /**
         * Renders the heading, the filter and the table for working with types.
         * @param event
         */
        switchToTypeMode: function (event) {
            if (!this.isTypeMode) {
                $("#creation-button").html("Create resource type");
                $("#heading").text("Resource types");
                this.showTypeFilter();
                this.showTypes(this.resourceTypes.models);
                this.isTypeMode = true;
            }
        },

        /**
         * Renders the heading, the filter and the table for working with types.
         * @param event
         */
        switchToResourceMode: function (event) {
            if (this.isTypeMode) {
                $("#creation-button").html("Create resource");
                $("#heading").text("Resources");
                this.showResourceFilter();
                this.showResources(this.resources.models);
                this.isTypeMode = false;
            }
        },

        /**
         * Shows the creation dialog between the control bar and the filter.
         * @param event
         */
        showCreationDialog: function (event) {
            if (this.isTypeMode) {
                this.showTypeCreationDialog();
            } else {
                this.showResourceCreationDialog();
            }
            console.log("starting creation process");
        },

        /**
         * Shows the type creation dialog between the control bar and the filter.
         * @param event
         */
        showTypeCreationDialog: function () {
            $.get("../templates/typeCreationDialogTemplate.html", function (data) {
                var creationDialogTemplateCompiled = Handlebars.compile(data);
                $("#creation-dialog").html(creationDialogTemplateCompiled());
            });
            this.isCreationDialogOpen = true;
        },

        /**
         * Shows the resource creation dialog between the control bar and the filter.
         * @param event
         */
        showResourceCreationDialog: function () {
            var that = this;
            $.get("../templates/resourceCreationDialogTemplate.html", function (data) {
                var creationDialogTemplateCompiled = Handlebars.compile(data, {noEscape: true});

                var typesHtml = '<option value="" disabled="disabled" selected="selected">Please select a type</option>';
                for (var i = 0; i < that.resourceTypes.models.length; i++) {
                    typesHtml = typesHtml + "<option>" + that.resourceTypes.models[i].get("name") + "</option>";
                }

                var context = {types: typesHtml.toString()};

                $("#creation-dialog").html(creationDialogTemplateCompiled(context).toString());
            });
            this.isCreationDialogOpen = true;
        },

        /**
         * Removes the creation dialog.
         * @param event
         */
        cancelCreation: function (event) {
            console.log("cancelling creation");
            this.isCreationDialogOpen = false;
            $("#creation-dialog").empty();
        },

        /**
         * Adds an attribute to a resource types creation dialog.
         * @param event
         */
        addAttributeToCreation: function (event) {
            console.log("adding attribute");
            var attributeName = $(event.target).closest("#add-attr-dialog").find("#new-attr-name").val();
            var attributeType = $(event.target).closest("#add-attr-dialog").find("#new-attr-type option:selected").text();
            $.get("../templates/attributeDefinitionTemplate.html", function (data) {
                var attributeTemplateCompiled = Handlebars.compile(data, {noEscape: true});
                var attrTypeHtml = "<option>String</option>";
                attrTypeHtml = attrTypeHtml.replace(new RegExp("(<option)(>" + attributeType + ")", 'i'),
                    "$1 selected$2"
                );
                var context = {attrvalue: "'" + attributeName + "'", attrtype: attrTypeHtml.toString()};
                $("#input-attributes").append(attributeTemplateCompiled(context).toString());
            });
            $(event.target).closest("#add-attr-dialog").find("#new-attr-name").val("");
            $(event.target).closest("#add-attr-dialog").find("#new-attr-type").val("String");
        },

        /**
         * Removes an attribute from a resource types creation dialog.
         * @param event
         */
        removeAttributeFromCreation: function (event) {
            console.log("removing attribute");
            $(event.target).closest(".attr-definition").remove();
        },

        /**
         * Creates a new type using the backend service of the Minventar.
         * @param event
         */
        createType: function (event) {
            event.preventDefault();
            var that = this;
            console.log("saving type");
            var newResourceType = {};
            newResourceType.name = $(event.target).find("#input-name").val();
            newResourceType.is_bundle = $(event.target).find("#input-is-bundle").is(':checked');
            var attributes = [];

            $(".attr-definition").each(function () {
                var attribute = {};
                attribute.name = $(this).find("#attr-name").val();
                attribute.type = $(this).find("#attr-type option:selected").text();
                attributes.push(attribute);
            });
            newResourceType.attributes = attributes;
            console.log(JSON.stringify(newResourceType));
            $.ajax({
                type: "POST",
                url: "minventar/api/resource_types",
                data: JSON.stringify(newResourceType),
                success: function () {
                    that.resourceTypes.fetch().always(function () {
                        success: if(that.isTypeMode){that.showTypes(that.resourceTypes.models)}
                    });
                    $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource type successfully created</div>');

                },
                error: function () {
                    $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while creating resource type</div>');

                }
            });
            this.isCreationDialogOpen = false;
        },
        /**
         * Creates a new resource using the backend service of the Minventar.
         * @param event
         */
        createResource: function (event) {
            event.preventDefault();
            var that = this;
            console.log("saving resource");
            var newResource = {};
            newResource.name = $(event.target).find("#input-name").val();
            //FIXME potential bug because the index of the select could change better write the mongoID in the option element and retrieve it here
            newResource.type = this.resourceTypes.models[($(event.target).find(":selected").index()) - 1].get("id");
            var attributes = [];

            $(".attr-definition").each(function () {
                var attribute = {};
                attribute.name = $(this).find("#attr-name-label").text();
                // remove the trailing colon
                attribute.name = attribute.name.substring(0, attribute.name.length - 1);
                attribute.value = $(this).find("#input-name").val();
                attributes.push(attribute);
            });
            newResource.attributes = attributes;

            var innerResources = [];

            $(".bundled-resource").each(function () {
                var innerResource = $(this).attr("id");
                innerResources.push(innerResource);
            });
            newResource.resources = innerResources;

            console.log(JSON.stringify(newResource));

            $.ajax({
                type: "POST",
                url: "minventar/api/resources",
                data: JSON.stringify(newResource),
                success: function () {
                    that.resources.fetch().always(function () {
                        success: if(!that.isTypeMode){that.showResources(that.resources.models)}
                    });
                    $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource successfully created</div>');

                },
                error: function () {
                    $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while creating resource</div>');

                }
            });
            this.isCreationDialogOpen = false;

        },

        /**
         * Triggers when the user has chosen a type for his new resource.
         * Makes input fields for the attributes of the chosen type visible and if its a bundle type makes a dialog visible to alter the contents of the bundle.
         * @param event
         */
        definedType: function (event, after) {
            $("#input-resource-attributes").empty();
            var resourceType = this.resourceTypes.models[($("#input-type").find(":selected").index()) - 1];
            var attributes = resourceType.get("attributes");

            $.get("../templates/attributeSelectionTemplate.html", function (data) {
                for (var i = 0; i < attributes.length; i++) {
                    var attrName = attributes[i].name;
                    var attributeTemplateCompiled = Handlebars.compile(data, {noEscape: true});
                    var context = {attrName: attrName};
                    $("#input-resource-attributes").append(attributeTemplateCompiled(context).toString());
                }
                if (null != after) {
                    after()
                }
                ;
            });
            // showing / hiding "add resource to bundle dialog"
            if (resourceType.get("is_bundle")) {
                $("#add-resource-dialog").css("visibility", "visible");
                var availableResources = this.getAvailableResources();
                var idDefined = $(".actions-bar").attr("id");
                var parents = (idDefined ? this.getParentResources(idDefined) : []);
                var availableResourcesHtml = '<option value="default-resource-selection" disabled="disabled" selected="selected">Available resources</option>';
                for (var i = 0; i < availableResources.length; i++) {
                    var resource = availableResources[i];
                    //resources only count as available if they do not contain the current bundle or are the bundle itself
                    if (!($.inArray(resource, parents) != -1) && idDefined != resource.get("id")) {
                        availableResourcesHtml = availableResourcesHtml + "<option id='" + resource.get("id") + "'>" + resource.get("name") + "</option>";
                    }
                }

                $("#new-resource").html(availableResourcesHtml);
            } else {
                $("#add-resource-dialog").css("visibility", "hidden");
            }
        },

        /**
         * Helper method which finds and returns all available (unused) resources.
         * @returns {Array}
         */
        getAvailableResources: function () {
            var availableResources = [];

            for (var i = 0; i < this.resources.models.length; i++) {

                var resource = this.resources.models[i];
                var inBundle = false;
                for (var j = 0; j < this.resources.models.length; j++) {

                    if (this.resources.models[j].get("resources")) {
                        if ($.inArray(resource.get("id"), this.resources.models[j].get("resources")) != -1) {
                            inBundle = true;
                            break;
                        }
                    }
                }
                if (!inBundle) {

                    availableResources.push(resource);
                }
            }
            return availableResources;
        },

        /**
         * Helper method which finds and returns the bundle containing the delivered resource. Returns false if this resource is unused.
         * @param resourceID
         * @returns {*}
         */
        getDirectParentResource: function (resourceID) {
            var resources = this.resources.models;

            for (var i = 0; i < resources.length; i++) {
                var resource = resources[i];
                if (resource.get("resources")) {
                    if ($.inArray(resourceID, resource.get("resources")) != -1) {
                        return resource;
                    }
                }
            }
            return false;

        },

        /**
         * Returns an array containing the parent, grandparent  etc.
         * @param resourceID
         * @returns {Array}
         */
        getParentResources: function (resourceID) {
            var result = [];

            var parent = this.getDirectParentResource(resourceID);
            while (parent) {

                result.push(parent);
                parent = this.getDirectParentResource(parent.get("id"));
            }
            return result;
        },

        /**
         * Returns an array containing the roots (top level bundles) of the delivered resources.
         * @param resources
         * @returns {Array}
         */
        getResourceRoots: function (resources) {
            var roots = [];

            for (var i = 0; i < resources.length; i++) {
                var parents = this.getParentResources(resources[i].get("id"));
                if (parents.length > 0) {
                    if (!($.inArray(parents[parents.length - 1], roots) != -1)) {
                        roots.push(parents[parents.length - 1]);
                    }
                } else {
                    if (!($.inArray(resources[i], roots) != -1)) {
                        roots.push(resources[i]);
                    }
                }

            }
            return roots;
        },

        /**
         *  Adds in the creation dialog a resource to a bundle .
         * @param event
         */
        addResourceToBundle: function (event) {
            var resourceName = $("#new-resource option:selected").text();

            var resourceIndex = $("#new-resource").find(":selected").index();

            if (resourceIndex != 0) {
                console.log("adding resource");
                var resourceID = $("#new-resource option:selected").attr("id");
                console.log(resourceID);
                var addedResourceHtml = '<div class="row bundled-resource" id="' + resourceID + '"><label  class="content-name control-label col-sm-3">';
                addedResourceHtml = addedResourceHtml + resourceName + '</label><div class="col-sm-1"><button id="rmv-resource" type="button" class="btn btn-link"><span class="glyphicon glyphicon-minus"style="color:red"></span></button></div></div>';
                $("#content").append(addedResourceHtml.toString());

                $("#new-resource").find(":selected").remove();
                $('#new-resource option[value=default-resource-selection]').prop('selected', true);
            }
        },

        /**
         * Removes in the creation dialog a resource to a bundle .
         * @param event
         */
        removeResourceFromBundle: function (event) {
            console.log("removing resource from bundle");
            $('#new-resource').append("'<option id='" + $(event.target).closest(".bundled-resource").attr("id") + "'>" + $(event.target).closest(".bundled-resource").find(".content-name").text() + "</option>");
            $(event.target).closest(".bundled-resource").remove();
        },

        /**
         * Renders the filter bar for resources.
         */
        showTypeFilter: function () {
            $.get("../templates/typeFilterTemplate.html", function (data) {
                var filterCompiled = Handlebars.compile(data, {noEscape: true});
                $("#filter-dialog").html(filterCompiled().toString());
            });
        },

        /**
         * Renders the filter bar for types.
         */
        showResourceFilter: function () {
            var that = this;
            $.get("../templates/resourceFilterTemplate.html", function (data) {
                var filterCompiled = Handlebars.compile(data, {noEscape: true});
                var typesHtml = "";
                for (var i = 0; i < that.resourceTypes.models.length; i++) {
                    typesHtml = typesHtml + "<option id='" + that.resourceTypes.models[i].get("id") + "'>" + that.resourceTypes.models[i].get("name") + "</option>";
                }

                var context = {types: typesHtml.toString()};
                $("#filter-dialog").html(filterCompiled(context).toString());
            });
        },

        /**
         *  Filters the contents of the table by the declared criteria. Filtering by name is implemented as a non case sensetive contains.
         * @param event
         */
        filter: function (event) {
            event.preventDefault();
            var that = this;
            if (this.isTypeMode) {

                var matchedTypes = this.resourceTypes.filter(function (model) {
                    console.log("filtering");
                    var name = $("#name-filter").val().toLowerCase();
                    console.log(name);
                    var mode = $("#filter-mode option:selected").index();
                    console.log(mode);

                    var modelName = model.get('name').toLowerCase();
                    switch (mode) {

                        case 0:
                            if (name) {
                                return modelName.indexOf(name) > -1;
                            } else {
                                console.log("filtered name is empty ");
                                return true;
                            }

                            break;
                        case 1:
                            return modelName.indexOf(name) > -1 && model.get('is_bundle');
                            break;
                        case 2:
                            return modelName.indexOf(name) > -1 && !model.get('is_bundle');
                            break;
                    }


                });
                console.log(matchedTypes.length);
                this.showTypes(matchedTypes);
            } else {

                var matchedResources = this.resources.filter(function (model) {
                    console.log("filtering");
                    var name = $("#name-filter").val().toLowerCase();
                    console.log(name);
                    var mode = $("#filter-mode option:selected").index();
                    console.log(mode);

                    var modelName = model.get('name').toLowerCase();
                    var typeID = $("#filter-mode option:selected").attr("id");
                    var modelType = that.resourceTypes.findWhere({id: model.get('type')});
                    switch (mode) {
                        case 0:
                            if (name) {
                                return modelName.indexOf(name) > -1;
                            } else {
                                console.log("filtered name is empty ");
                                return true;
                            }
                            break;
                        case 1:
                            return modelName.indexOf(name) > -1 && modelType.get('is_bundle');
                            break;
                        case 2:
                            return modelName.indexOf(name) > -1 && !modelType.get('is_bundle');
                            break;
                        default:
                            return modelName.indexOf(name) > -1 && model.get('type') == typeID;
                            break;
                    }


                });
                this.showResources(matchedResources);
            }
        },

        /**
         * Resets the filter bar.
         * @param event
         */
        resetFilter: function (event) {
            if (this.isTypeMode) {
                this.showTypeFilter();
                this.showTypes(this.resourceTypes.models);
            } else {
                this.showResourceFilter();
                this.showResources(this.resources.models);
            }

        },

        /**
         * Adds the given types to the table.
         * @param types
         */
        showTypes: function (types) {
            console.log("rendering types");
            var that = this;
            $.get("../templates/typesDataTableTemplate.html", function (data) {
                var dataTableCompiled = Handlebars.compile(data, {noEscape: true});
                var dataHtml = '';
                for (var i = 0; i < types.length; i++) {
                    var type = types[i];
                    dataHtml += '<tr class="data-row" id="' + type.get("id") + '">  <td class="type-name">' + type.get("name");
                    dataHtml += '<div class="pull-right text-right">';
                    dataHtml += (!type.get("is_bundle") ? '<button type="button" class="btn btn-link" style="cursor: default; color: #000000" ><span class="glyphicon glyphicon-file"></span></button>'
                        : '<button id="extend-bundle-btn" type="button" class="btn btn-link" style="cursor: default; color: #000000"><span class="glyphicon glyphicon-folder-close"></span></button>');
                    dataHtml += '<button id="edit-type-btn" type="button" class="btn btn-link"><span class="glyphicon glyphicon-edit"></span></button>';

                    dataHtml += '</div>';
                    dataHtml += "</td> <td>" + that.attributeDefinitionsAsString(type.get("attributes")) + "</td> </tr>";
                }

                var context = {data: dataHtml};
                $("#data-table").html(dataTableCompiled(context).toString());
            });
        },

        /**
         * Adds the given resources to the table.
         * @param types
         */
        showResources: function (resources) {
            console.log("rendering resources");
            var that = this;
            $.get("../templates/resourcesDataTableTemplate.html", function (data) {
                var dataTableCompiled = Handlebars.compile(data, {noEscape: true});
                var dataHtml = '';
                var sortedResources = that.getResourcesHierarchicallySorted(resources);


                for (var i = 0; i < sortedResources.length; i++) {
                    var resource = sortedResources[i];
                    var type = that.resourceTypes.findWhere({id: resource.get('type')});
                    var parent = that.getDirectParentResource(resource.get("id"));


                    dataHtml += '<tr class="data-row treegrid-' + resource.get("id") + (!parent ? ' ' : ' treegrid-parent-' + parent.get('id')) + '" id="' + resource.get("id") + '" ' + ((parent) && i != 0 ? 'style="border-top: hidden"' : "") + '>  <td class="resource-name">' + resource.get("name");
                    dataHtml += '<div class="pull-right text-right">';
                    dataHtml += (!type.get("is_bundle") ? '<button type="button" class="btn btn-link" style="cursor: default; color: #000000" ><span class="glyphicon glyphicon-file"></span></button>'
                        : '<button id="extend-bundle-btn" type="button" class="btn btn-link" style="cursor: default; color: #000000"><span class="glyphicon glyphicon-folder-close"></span></button>');
                    dataHtml += '<button id="edit-resource-btn" type="button" class="btn btn-link"><span class="glyphicon glyphicon-edit"></span></button>';
                    dataHtml += '</div>';
                    dataHtml += "</td><td class='type-cell' id ='" + type.get("id") + "'>" + type.get("name") + "</td><td>" + that.attributesAsString(resource.get("attributes")) + "</td> </tr>";
                }

                var context = {data: dataHtml};
                $("#data-table").html(dataTableCompiled(context).toString());
                $('.tree').treegrid();

            });
        },

        /**
         * Helper method which converts the given attribute definitions to a string.
         * @param attributes
         * @returns {string}
         */
        attributeDefinitionsAsString: function (attributes) {
            var result = "";
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                result += attribute.name + ": " + attribute.type + (i != attributes.length - 1 ? "<br>" : "");
            }
            return result;
        },

        /**
         * Helper method which converts the given attributes to a string.
         * @param attributes
         * @returns {string}
         */
        attributesAsString: function (attributes) {
            var result = "";
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                result += attribute.name + ": " + attribute.value + (i != attributes.length - 1 ? "<br>" : "");
            }
            return result;
        },

        /**
         * Shows the creation dialog for an existing resource.
         * @param id
         */
        editResource: function (id) {
            var that = this;
            $.get("../templates/resourceUpdateDialogTemplate.html", function (data) {
                var updateDialogTemplateCompiled = Handlebars.compile(data, {noEscape: true});
                var resource = that.resources.findWhere({id: id});
                var typeID = resource.get("type");
                var name = resource.get("name");
                var typesHtml = '<option value="" disabled="disabled" selected="selected">Please select a type</option>';
                for (var i = 0; i < that.resourceTypes.models.length; i++) {
                    var resourceType = that.resourceTypes.models[i];
                    typesHtml = typesHtml + "<option id='" + resourceType.get("id") + "'" + (typeID == resourceType.get("id") ? 'selected="selected"' : "") + ">" + resourceType.get("name") + "</option>";
                }

                var contentHtml = "";
                var context = {
                    name: name,
                    types: typesHtml.toString(),
                    id: id,
                    content: contentHtml
                };

                $("#creation-dialog").html(updateDialogTemplateCompiled(context));
                $("#creation-dialog").closest(".actions-bar").attr("id", id);

                var parentResource = that.getDirectParentResource(id);

                if (parentResource) {
                    $("#parent-btn").css("visibility", "visible");
                }


                that.definedType(null, function () {
                    var i = 0;
                    $(".attr-definition").each(function () {
                        var attributeValue = resource.get("attributes")[i]['value'];
                        $(this).find("#input-name").val(attributeValue);
                        $(this).find("#input-name").attr("placeholder", attributeValue);
                        i++;
                    });
                });
                var innerResources = resource.get("resources");

                for (var i = 0; i < innerResources.length; i++) {

                    var innerResource = innerResources[i];
                    var innerResourceName = that.resources.findWhere({id: innerResource}).get("name");

                    var addedResourceHtml = '<div class="row bundled-resource" id="' + innerResource + '"><label  class="content-name control-label col-sm-3">';
                    addedResourceHtml = addedResourceHtml + innerResourceName + '</label><div class="col-sm-1"><button id="rmv-resource" type="button" class="btn btn-link"><span class="glyphicon glyphicon-minus"style="color:red"></span></button></div></div>';
                    $("#content").append(addedResourceHtml.toString());


                }


            });
            this.isCreationDialogOpen = true;
        },

        /**
         * Shows the creation dialog for an existing resource.
         */
        editResourceEvent: function (event) {
            console.log("editing resource");
            var id = $(event.target).parents(".data-row").attr("id");

            this.editResource(id);

        },

        /**
         * Shows the creation dialog for an existing type.
         */
        editType: function (event) {
            console.log("editing type");
            $.get("../templates/typeUpdateDialogTemplate.html", function (data) {
                var updateDialogTemplateCompiled = Handlebars.compile(data, {noEscape: true});
                var id = $(event.target).parents(".data-row").attr("id");
                var name = $(event.target).parents(".data-row").find(".type-name").text();
                var context = {id: id, name: name};
                $("#creation-dialog").html(updateDialogTemplateCompiled(context));
                $("#creation-dialog").find(".actions-bar").attr("id", id);
            });
            this.isCreationDialogOpen = true;
        },

        /**
         * Saves a resource/type using the backend service of the Minventar.
         * @param id
         */
        save: function (event) {
            event.preventDefault();
            var that = this;
            if (this.isTypeMode) {
                console.log("saving type");
                var resourceType = {};
                resourceType.name = $(event.target).parents("#update-form").find("#input-name").val();
                var id = $(".actions-bar").attr("id");
                console.log(id);
                console.log(JSON.stringify(resourceType));
                $.ajax({
                    type: "PUT",
                    url: "minventar/api/resource_types/" + id,
                    data: JSON.stringify(resourceType),
                    success: function () {
                        that.resourceTypes.fetch().always(function () {
                            success: that.showTypes(that.resourceTypes.models)
                        });
                        $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource type successfully modified</div>');
                    },
                    error: function () {
                        $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while changing resource type</div>');
                    }
                });
                this.isCreationDialogOpen = false;
            } else {
                console.log("saving resource");

                var resource = {};
                resource.name = $(event.target).parents("#update-form").find("#input-name").val();
                var id = $(".actions-bar").attr("id");
                //FIXME potential bug because the index of the select could change better write the mongoID in the option element and retrieve it here
                resource.type = this.resourceTypes.models[($(event.target).parents("#update-form").find(":selected").index()) - 1].get("id");
                var attributes = [];

                $(".attr-definition").each(function () {
                    var attribute = {};
                    attribute.name = $(this).find("#attr-name-label").text();
                    // remove the trailing colon
                    attribute.name = attribute.name.substring(0, attribute.name.length - 1);
                    attribute.value = $(this).find("#input-name").val();
                    attributes.push(attribute);
                });
                resource.attributes = attributes;

                var innerResources = [];

                $(".bundled-resource").each(function () {
                    var innerResource = $(this).attr("id");
                    innerResources.push(innerResource);
                });
                resource.resources = innerResources;

                console.log(JSON.stringify(resource));

                $.ajax({
                    type: "PUT",
                    url: "minventar/api/resources/" + id,
                    data: JSON.stringify(resource),
                    success: function () {
                        that.resources.fetch().always(function () {
                            success: that.showResources(that.resources.models)
                        });
                        $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource successfully modified</div>');

                    },
                    error: function () {
                        $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while changing resource</div>');

                    }
                });
                this.isCreationDialogOpen = false;
            }
        },

        /**
         * Deletes a resource/type using the backend service of the Minventar.
         * @param id
         */
        delete: function (event) {
            event.preventDefault();
            var that = this;
            if (this.isTypeMode) {
                console.log("deleting type");
                var id = $(".actions-bar").attr("id");
                console.log(id);
                $.ajax({
                    type: "DELETE",
                    url: "minventar/api/resource_types/" + id,
                    success: function () {
                        that.resourceTypes.fetch().always(function () {
                            success: that.showTypes(that.resourceTypes.models)
                        });
                        $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource type successfully deleted</div>');
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (jqXHR.status == 400) {
                            $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource type could not be deleted because it is still in use.</div>');
                        } else {
                            $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while deleting resource type</div>');
                        }
                    }
                });
                this.isCreationDialogOpen = false;
            } else {
                console.log("deleting resource");
                var id = $(".actions-bar").attr("id");
                console.log(id);
                $.ajax({
                    type: "DELETE",
                    url: "minventar/api/resources/" + id,
                    success: function () {
                        that.resources.fetch().always(function () {
                            success: that.showResources(that.resources.models)
                        });
                        $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource successfully deleted</div>');
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (jqXHR.status == 400) {
                            $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource could not be deleted because it is still in use.</div>');
                        } else {
                            $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while deleting resource</div>');
                        }
                    }
                });
                this.isCreationDialogOpen = false;
            }
        },

        /**
         * Shows the creation dialog for the parent of the currently edited resource
         * @param event
         */
        editParent: function (event) {
            var id = $(".actions-bar").attr("id");
            this.editResource(this.getDirectParentResource(id).get("id"));
            console.log(this.getDirectParentResource(id).get("id"));
        },

        /**
         * Helper method which returns the given resources sorted in a way that they can be hierarchically displayed.
         * @param resources
         * @returns {Array}
         */
        getResourcesHierarchicallySorted: function (resources) {
            var result = [];
            var availableResources = this.getResourceRoots(resources);
            this.getResourcesHierarchicallySortedRecursive(availableResources, result);
            return result;
        },

        /**
         * Helper method which returns the given resources sorted in a way that they can be hierarchically displayed.
         * @param resources
         * @returns {Array}
         */
        getResourcesHierarchicallySortedRecursive: function (resources, result) {
            for (var i = 0; i < resources.length; i++) {
                var resource = resources[i];
                result.push(resource);
                if (resource.get("resources").length > 0) {

                    var currentChildren =
                        this.resources.filter(function (model) {
                            return $.inArray(model.get("id"), resource.get("resources")) != -1;
                        });
                    this.getResourcesHierarchicallySortedRecursive(currentChildren, result);
                }
            }
        }
    }
)