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
            "submit #type-update-dialog": "save",
            "click #delete-btn": "delete"
        }
        ,

        initialize: function () {
            console.log("initializing minventar");
            this.resourceTypes = new ResourceTypes();
            this.resourceTypes.fetch();
            this.resources = new Resources();
            this.resources.fetch();


            this.showResourceFilter();
            this.showResources();
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
                this.showResources();
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
                //FIXME potential bug because the index of the select could change better wirte the mongoID in the option element and retrive it here
                newResource.type = this.resourceTypes.models[($(event.target).find(":selected").index()) - 1].get("id");
                var attributes = [];

                $(".attr-definition").each(function () {
                    var attribute = {};
                    attribute.name = $(this).find("#attr-name-label").text();
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
                            success: that.showTypes(that.resourceTypes.models)
                        });
                        $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource successfully created</div>');
                        that.showResources(that.resources.models);

                    },
                    error: function () {
                        $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while creating resource</div>');

                    }
                });
                this.isCreationDialogOpen = false;

            }
        },

        definedType: function (event) {
            $("#input-resource-attributes").empty();
            var resourceType = this.resourceTypes.models[($(event.target).find(":selected").index()) - 1];
            var attributes = resourceType.get("attributes");

            $.get("../templates/attributeSelectionTemplate.html", function (data) {
                for (var i = 0; i < attributes.length; i++) {
                    var attrName = attributes[i].name;
                    var attributeTemplateCompiled = Handlebars.compile(data, {noEscape: true});
                    var context = {attrName: attrName};
                    $("#input-resource-attributes").append(attributeTemplateCompiled(context).toString());
                }
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
        },
        addResourceToBundle: function (event) {
            var resourceName = $("#new-resource option:selected").text();
            var resourceIndex = $("#new-resource").find(":selected").index();

            if (resourceIndex != 0) {
                console.log("adding resource");
                // Nicht möglich! ID muss ins Option feld
                var resourceID = $("#new-resource option:selected").attr("id");
                console.log(resourceID);
                var addedResourceHtml = '<div class="row bundled-resource" id="' + resourceID + '"><label  class="content-name control-label col-sm-3">';
                addedResourceHtml = addedResourceHtml + resourceName + '</label><div class="col-sm-1"><button id="rmv-resource" type="button" class="btn btn-link"><span class="glyphicon glyphicon-minus"style="color:red"></span></button></div></div>';
                $("#content").append(addedResourceHtml.toString());
            }
            $("#new-resource").find(":selected").remove();
            $('#new-resource option[value=default-resource-selection]').prop('selected', true);
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
                    typesHtml = typesHtml + "<option>" + that.resourceTypes.models[i].get("name") + "</option>";
                }

                var context = {types: typesHtml.toString()};
                $("#filter-dialog").html(filterCompiled(context).toString());
            });
        },
        filter: function (event) {
            event.preventDefault();
            if (this.isTypeMode) {

                var matchedTypes = this.resourceTypes.filter(function (model) {
                    console.log("filtering");
                    var name = $("#name-filter").val();
                    console.log(name);
                    var mode = $("#filter-mode option:selected").index();
                    console.log(mode);
                    switch (mode) {
                        case 0:
                            if (name) {
                                return model.get('name').indexOf(name) > -1;
                            } else {
                                console.log("filtered name is empty ");
                                return true;
                            }

                            break;
                        case 1:
                            return model.get('name').indexOf(name) > -1 && model.get('is_bundle');
                        case 2:
                            return model.get('name').indexOf(name) > -1 && !model.get('is_bundle');
                    }


                });
                console.log(matchedTypes.length);
                this.showTypes(matchedTypes);
            } else {
                this.showResources(this.resources.models);
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
            //console.log(JSON.stringify(types));
            var that = this;
            $.get("../templates/typesDataTableTemplate.html", function (data) {
                var dataTableCompiled = Handlebars.compile(data, {noEscape: true});
                var dataHtml = '';
                for (var i = 0; i < types.length; i++) {
                    var type = types[i];
                    dataHtml += '<tr class="data-row" id="' + type.get("id") + '">  <td>' + type.get("name");
                    dataHtml += '<div class="pull-right text-right">';
                    dataHtml += '<button id="edit-type-btn" type="button" class="btn btn-link"><span class="glyphicon glyphicon-edit"></span></button>';
                    dataHtml += (!type.get("is_bundle") ? '<button id="extend-bundle-btn" type="button" class="btn btn-link" style="cursor: default; color: #000000" ><span class="glyphicon glyphicon-file"></span></button>'
                        : '<button id="extend-bundle-btn" type="button" class="btn btn-link" style="cursor: default;"><span class="glyphicon glyphicon-folder-close"></span></button>');
                    dataHtml += '</div>';
                    dataHtml += "</td> <td>" + that.attributeDefinitionsAsString(type.get("attributes")) + "</td> </tr>";
                }

                var context = {data: dataHtml};
                $("#data-table").html(dataTableCompiled(context).toString());
            });
        },
        showResources: function () {
            var that = this;
            $.get("../templates/resourcesDataTableTemplate.html", function (data) {
                var dataTableCompiled = Handlebars.compile(data, {noEscape: true});
                $("#data-table").html(dataTableCompiled().toString());
            });
        }, attributeDefinitionsAsString: function (attributes) {
            var result = "";
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                // result += attribute.name + ": " + attribute.type + (i != attributes.length - 1 ? ", " : "");
                result += attribute.name + ": " + attribute.type + (i != attributes.length - 1 ? "<br>" : "");
            }
            return result;
        },
        editType: function (event) {
            console.log("editing type");
            $.get("../templates/typeUpdateDialogTemplate.html", function (data) {
                var updateDialogTemplateCompiled = Handlebars.compile(data);
                var id = $(event.target).parents(".data-row").attr("id");
                $("#creation-dialog").html(updateDialogTemplateCompiled());
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
                resourceType.name = $(event.target).find("#input-name").val();
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
                        $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource type successfully changed</div>');
                    },
                    error: function () {
                        $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while changing resource type</div>');
                    }
                });
                this.isCreationDialogOpen = false;
            } else {

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
                    error: function () {
                        $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while deleting resource type</div>');
                    }
                });
                this.isCreationDialogOpen = false;
            } else {

            }
        }
    }
);