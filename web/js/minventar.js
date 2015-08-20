/**
 * Created by Daniel Schulz on 18.08.2015.
 */
$(document).ready(function () {


    var MinventarView = Backbone.View.extend({

            isTypeMode: false,
            isCreationDialogOpen: false,

            events: {
                "click #creation-button": "showCreationDialog",
                "click #resources-types-radio": "switchToTypeMode",
                "click #resources-radio": "switchToResourceMode",

                "submit #creation-form": "create",
                "click #cancel-btn": "cancelCreation",
                "click #add-attr": "addAttributeToCreation",
                "click #rmv-attr": "removeAttributeToCreation"
            }
            ,

            initialize: function () {
                this.render();
            }
            ,
            render: function () {

            },
            switchToTypeMode: function (event) {
                if (!this.isCreationDialogOpen) {
                    if (!this.isTypeMode) {
                        $("#creation-button").html("Create resource type");
                        $("#heading").text("Resource types");
                        this.isTypeMode = true;
                    }
                }
            }, switchToResourceMode: function (event) {
                if (!this.isCreationDialogOpen) {
                    if (this.isTypeMode) {
                        $("#creation-button").html("Create resource");
                        $("#heading").text("Resources");
                        this.isTypeMode = false;
                    }
                }
            },
            showCreationDialog: function (event) {
                if (!this.isCreationDialogOpen) {
                    if (this.isTypeMode) {
                        this.showTypeCreationDialog();
                    } else {
                        this.showResourceCreationDialog();
                    }
                    console.log("starting creation process");
                }
            },
            showTypeCreationDialog: function () {
                $.get("../templates/typeCreationDialogTemplate.html", function (data) {
                    var creationDialogTemplateCompiled = Handlebars.compile(data);
                    $("#creation-dialog").html(creationDialogTemplateCompiled());
                });
                this.isCreationDialogOpen = true;
            },
            showResourceCreationDialog: function () {
                $.get("../templates/resourceCreationDialogTemplate.html", function (data) {
                    var creationDialogTemplateCompiled = Handlebars.compile(data);
                    $("#creation-dialog").html(creationDialogTemplateCompiled());
                });
                this.isCreationDialogOpen = true;
            },
            cancelCreation: function (event) {
                console.log("cancelling creation");
                this.isCreationDialogOpen = false;
                $("#creation-dialog").empty();
            },
            addAttributeToCreation: function (event) {
                console.log("adding attribute");
                var attributeName = $(event.target).closest("#add-attr-dialog").find("#new-attr-name").val();
                var attributeType = $(event.target).closest("#add-attr-dialog").find("#new-attr-type option:selected").text();
                $.get("../templates/attributeDefinitionTemplate.html", function (data) {
                    var attributeTemplateCompiled = Handlebars.compile(data, {noEscape: true});
                    var attrTypeHtml = "<option>String</option> <option>Text</option> <option>Number</option>";
                    attrTypeHtml = attrTypeHtml.replace(new RegExp("(<option)(>" + attributeType + ")", 'i'),
                        "$1 selected$2"
                    )
                    ;
                    var context = {attrvalue: attributeName, attrtype: attrTypeHtml.toString()};
                    $("#input-attributes").append(attributeTemplateCompiled(context).toString());
                });
                $(event.target).closest("#add-attr-dialog").find("#new-attr-name").val("");
                $(event.target).closest("#add-attr-dialog").find("#new-attr-type").val("String");
            },
            removeAttributeToCreation: function (event) {
                console.log("removing attribute");
                $(event.target).closest(".attr-definition").remove();
            },
            create: function (event) {
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
                            $("#creation-dialog").html('<div class="alert alert-success alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Resource type successfully created</div>');
                        },
                        error: function () {
                            $("#creation-dialog").html('<div class="alert alert-danger alert-dismissible col-sm-6" role="alert">    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Error while creating resource type</div>');

                        }
                    });
                    this.isCreationDialogOpen = false;
                } else {
                    console.log("saving resource");
                }
            }
        }
    );


    var minventarView = new MinventarView({el: $("#minventar")});
})
;