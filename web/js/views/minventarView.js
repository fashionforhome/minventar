/**
 * Created by Daniel Schulz on 21.08.2015.
 */
var MinventarView = Backbone.View.extend({

        resourceTypes: {},
        resources: {},
        isTypeMode: false,
        isCreationDialogOpen: false,

        events: {
            "click #creation-button": "showCreationDialog",
            "click #resources-types-radio": "switchToTypeMode",
            "click #resources-radio": "switchToResourceMode",

            "submit #creation-form": "create",
            "click #cancel-btn": "cancelCreation",
            "click #add-attr": "addAttributeToCreation",
            "click #rmv-attr": "removeAttributeToCreation",
            "change #input-type": "definedType",
            "click #add-resource": "addResourceToBundle",
            "click #rmv-resource": "removeResourceFromBundle",

            "submit #filter-form": "filter",
            "click #filter-reset-btn": "resetFilter",
            "click #edit-type-btn": "editType",
            "click #save-btn": "save",
            "click  #delete-btn": "delete",
            "click #edit-resource-btn": "editResourceEvent",
            "click #extend-bundle-btn": "extendBundleEvent",
            "click #parent-btn": "editParent"
        }
        ,

        initialize: function () {
            console.log("initializing minventar");
            this.resourceTypes = new ResourceTypes();
            this.resourceTypes.fetch();
            this.resources = new Resources();
            this.resources.fetch();


            this.showResourceFilter();
            this.showResources(this.resources.models);
        }
        ,
        render: function () {

        },
        switchToTypeMode: function (event) {
            if (!this.isTypeMode) {
                $("#creation-button").html("Create resource type");
                $("#heading").text("Resource types");
                this.showTypeFilter();
                this.showTypes(this.resourceTypes.models);
                this.isTypeMode = true;
            }
        }, switchToResourceMode: function (event) {
            if (this.isTypeMode) {
                $("#creation-button").html("Create resource");
                $("#heading").text("Resources");
                this.showResourceFilter();
                this.showResources(this.resources.models);
                this.isTypeMode = false;
            }
        },
        showCreationDialog: function (event) {
            if (this.isTypeMode) {
                this.showTypeCreationDialog();
            } else {
                this.showResourceCreationDialog();
            }
            console.log("starting creation process");
        },
        showTypeCreationDialog: function () {
            $.get("../templates/typeCreationDialogTemplate.html", function (data) {
                var creationDialogTemplateCompiled = Handlebars.compile(data);
                $("#creation-dialog").html(creationDialogTemplateCompiled());
            });
            this.isCreationDialogOpen = true;
        },
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
        cancelCreation: function (event) {
            console.log("cancelling creation");
            this.isCreationDialogOpen = false;
            $("#creation-dialog").empty();
        }

        ,
        addAttributeToCreation: function (event) {
            console.log("adding attribute");
            var attributeName = $(event.target).closest("#add-attr-dialog").find("#new-attr-name").val();
            var attributeType = $(event.target).closest("#add-attr-dialog").find("#new-attr-type option:selected").text();
            $.get("../templates/attributeDefinitionTemplate.html", function (data) {
                var attributeTemplateCompiled = Handlebars.compile(data, {noEscape: true});
                var attrTypeHtml = "<option>String</option>";
                attrTypeHtml = attrTypeHtml.replace(new RegExp("(<option)(>" + attributeType + ")", 'i'),
                    "$1 selected$2"
                )
                ;
                var context = {attrvalue: attributeName, attrtype: attrTypeHtml.toString()};
                $("#input-attributes").append(attributeTemplateCompiled(context).toString());
            });
            $(event.target).closest("#add-attr-dialog").find("#new-attr-name").val("");
            $(event.target).closest("#add-attr-dialog").find("#new-attr-type").val("String");
        }
        ,
        removeAttributeToCreation: function (event) {
            console.log("removing attribute");
            $(event.target).closest(".attr-definition").remove();
        }
        ,
        create: function (event) {
            event.preventDefault();
            var that = this;
            if (this.isTypeMode) {
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
                            success: that.showTypes(that.resourceTypes.models)
                        });
                        $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource type successfully created</div>');

                    },
                    error: function () {
                        $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while creating resource type</div>');

                    }
                });
                this.isCreationDialogOpen = false;
            } else {
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
                            success: that.showResources(that.resources.models)
                        });
                        $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource successfully created</div>');

                    },
                    error: function () {
                        $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while creating resource</div>');

                    }
                });
                this.isCreationDialogOpen = false;

            }
        },

        definedType: function (event, after) {
            console.log("first");
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
                var availableResourcesHtml = '<option value="default-resource-selection" disabled="disabled" selected="selected">Available resources</option>';
                console.log(availableResources.length);
                for (var i = 0; i < availableResources.length; i++) {
                    var resource = availableResources[i];
                    console.log(resource.get("name"));
                    availableResourcesHtml = availableResourcesHtml + "<option id='" + resource.get("id") + "'>" + resource.get("name") + "</option>";
                }

                $("#new-resource").html(availableResourcesHtml);
            } else {
                $("#add-resource-dialog").css("visibility", "hidden");
            }

        }, getAvailableResources: function () {
            var unusedResources = [];
            var resources = this.resources.models;

            for (var i = 0; i < resources.length; i++) {

                var resource = resources[i];
                var inBundle = false;
                for (var j = 0; j < resources.length; j++) {

                    if (resources[j].get("resources")) {
                        if ($.inArray(resource.get("id"), resources[j].get("resources")) != -1) {
                            inBundle = true;
                            break;
                        }
                    }
                }
                if (!inBundle) {

                    unusedResources.push(resource);
                }
            }
            console.log(unusedResources.length);
            return unusedResources;
        }, getParentResource: function (resourceID) {
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


        removeResourceFromBundle: function (event) {
            console.log("removing resource from bundle");
            $('#new-resource').append("'<option id='" + $(event.target).closest(".bundled-resource").attr("id") + "'>" + $(event.target).closest(".bundled-resource").find(".content-name").text() + "</option>");
            $(event.target).closest(".bundled-resource").remove();
        },
        showTypeFilter: function () {
            $.get("../templates/typeFilterTemplate.html", function (data) {
                var filterCompiled = Handlebars.compile(data, {noEscape: true});
                $("#filter-dialog").html(filterCompiled().toString());
            });
        },
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
                console.log(matchedResources.length);
                this.showResources(matchedResources);
            }

        }, resetFilter: function (event) {
            if (this.isTypeMode) {
                this.showTypeFilter();
                this.showTypes(this.resourceTypes.models);
            } else {
                this.showResourceFilter();
                this.showResources(this.resources.models);
            }

        },
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
                    dataHtml += '<button id="edit-type-btn" type="button" class="btn btn-link"><span class="glyphicon glyphicon-edit"></span></button>';
                    dataHtml += (!type.get("is_bundle") ? '<button type="button" class="btn btn-link" style="cursor: default; color: #000000" ><span class="glyphicon glyphicon-file"></span></button>'
                        : '<button id="extend-bundle-btn" type="button" class="btn btn-link" style="cursor: default;"><span class="glyphicon glyphicon-folder-close"></span></button>');
                    dataHtml += '</div>';
                    dataHtml += "</td> <td>" + that.attributeDefinitionsAsString(type.get("attributes")) + "</td> </tr>";
                }

                var context = {data: dataHtml};
                $("#data-table").html(dataTableCompiled(context).toString());
            });
        },
        showResources: function (resources) {
            console.log("rendering resources");
            var that = this;
            $.get("../templates/resourcesDataTableTemplate.html", function (data) {
                var dataTableCompiled = Handlebars.compile(data, {noEscape: true});
                var dataHtml = '';
                for (var i = 0; i < resources.length; i++) {
                    var resource = resources[i];
                    var type = that.resourceTypes.findWhere({id: resource.get('type')});
                    console.log(type.get('name'));
                    dataHtml += '<tr class="data-row" id="' + resource.get("id") + '">  <td class="resource-name">' + resource.get("name");
                    dataHtml += '<div class="pull-right text-right">';
                    dataHtml += '<button id="edit-resource-btn" type="button" class="btn btn-link"><span class="glyphicon glyphicon-edit"></span></button>';
                    dataHtml += (!type.get("is_bundle") ? '<button type="button" class="btn btn-link" style="cursor: default; color: #000000" ><span class="glyphicon glyphicon-file"></span></button>'
                        : '<button id="extend-bundle-btn" type="button" class="btn btn-link"><span class="glyphicon glyphicon-folder-close"></span></button>');
                    dataHtml += '</div>';
                    dataHtml += "</td><td class='type-cell' id ='" + type.get("id") + "'>" + type.get("name") + "</td><td>" + that.attributesAsString(resource.get("attributes")) + "</td> </tr>";
                }

                var context = {data: dataHtml};
                $("#data-table").html(dataTableCompiled(context).toString());
            });
        }, attributeDefinitionsAsString: function (attributes) {
            var result = "";
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                // result += attribute.name + ": " + attribute.type + (i != attributes.length - 1 ? ", " : "");
                result += attribute.name + ": " + attribute.type + (i != attributes.length - 1 ? "<br>" : "");
            }
            return result;
        }, attributesAsString: function (attributes) {
            var result = "";
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                // result += attribute.name + ": " + attribute.type + (i != attributes.length - 1 ? ", " : "");
                result += attribute.name + ": " + attribute.value + (i != attributes.length - 1 ? "<br>" : "");
            }
            return result;
        },

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

                var parentResource = that.getParentResource(id);

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
                    console.log(innerResourceName);

                    var addedResourceHtml = '<div class="row bundled-resource" id="' + innerResource + '"><label  class="content-name control-label col-sm-3">';
                    addedResourceHtml = addedResourceHtml + innerResourceName + '</label><div class="col-sm-1"><button id="rmv-resource" type="button" class="btn btn-link"><span class="glyphicon glyphicon-minus"style="color:red"></span></button></div></div>';
                    $("#content").append(addedResourceHtml.toString());


                }


            });
            this.isCreationDialogOpen = true;
        },
        editResourceEvent: function (event) {
            console.log("editing resource");
            var id = $(event.target).parents(".data-row").attr("id");

            this.editResource(id);

        },
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
        }, delete: function (event) {
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
        }, extendBundle: function (bundleID) {
            console.log("extending bundle: ", bundleID);
        },

        extendBundleEvent: function (event) {
            if (!this.isTypeMode) {
                var bundleID = $(event.target).parents(".data-row").attr("id");
                this.extendBundle(bundleID);
            }
        },

        editParent: function (event) {
            var id = $(".actions-bar").attr("id");
            this.editResource(this.getParentResource(id).get("id"));
            console.log(this.getParentResource(id).get("id"));
        }
    }
);