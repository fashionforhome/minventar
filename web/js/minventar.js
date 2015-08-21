/**
 * Created by Daniel Schulz on 18.08.2015.
 */
$(document).ready(function () {


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
                "click #rmv-resource": "removeResourceFromBundle"
            }
            ,

            initialize: function () {
                console.log("using backup version");
                console.log("initializing minventar");
                this.resourceTypes = new ResourceTypes();
                this.resourceTypes.fetch();
                this.resources = new Resources();
                this.resources.fetch();
            }
            ,
            render: function () {

            },
            switchToTypeMode: function (event) {
                if (!this.isTypeMode) {
                    $("#creation-button").html("Create resource type");
                    $("#heading").text("Resource types");
                    this.isTypeMode = true;
                }
            }, switchToResourceMode: function (event) {
                if (this.isTypeMode) {
                    $("#creation-button").html("Create resource");
                    $("#heading").text("Resources");
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
                            that.resourceTypes.fetch();
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
                            that.resources.fetch();
                            $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource successfully created</div>');

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
                    var availableResourcesHtml = '<option value="default-resource-selection" disabled="disabled" selected="selected">Select a resource</option>';
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
            }
        }
    );

    var ResourceType = Backbone.Model.extend({
        urlRoot: "minventar/api/resource_types",
        id: "",
        name: "",
        is_bundle: "",
        attributes: [],
        initialize: function () {
        }
    });

    var ResourceTypes = Backbone.Collection.extend({
        model: ResourceType,
        url: "minventar/api/resource_types",
        initialize: function () {
        },
        parse: function (response) {
            var resourceTypeModels = [];

            for (var i = 0; i < response.length; i++) {
                var resourceTypeIn = response[i];
                var resourceType = new ResourceType({
                    id: resourceTypeIn.id,
                    name: resourceTypeIn.name,
                    is_bundle: resourceTypeIn.is_bundle,
                    attributes: resourceTypeIn.attributes
                });
                resourceTypeModels.push(resourceType);
            }
            return resourceTypeModels;
        }
    });

    var Resource = Backbone.Model.extend({
        urlRoot: "minventar/api/resources",
        id: "",
        name: "",
        type: "",
        attributes: [],
        resources: [],
        initialize: function () {
        }
    });

    var Resources = Backbone.Collection.extend({
        model: Resource,
        url: "minventar/api/resources",
        initialize: function () {
        },
        parse: function (response) {
            var resourceModels = [];

            for (var i = 0; i < response.length; i++) {
                var resourceIn = response[i];
                var resource = new Resource({
                    id: resourceIn.id,
                    name: resourceIn.name,
                    type: resourceIn.type,
                    attributes: resourceIn.attributes,
                    resources: resourceIn.resources
                });
                resourceModels.push(resource);
            }
            return resourceModels;
        }
    });
    var minventarView = new MinventarView({el: $("#minventar")});
})
;