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

                "click #create-btn": "create",
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
                $(event.target).closest("#attr-definition").remove();
            }
        }
    );

    var TypeCreationDialogView = Backbone.View.extend({
        events: {
            "click #create-btn": "create",
            "click #cancel-btn": "cancel",
            "click #add-attr": "addAttribute"

        }
        ,

        initialize: function () {
            this.render();
        }
        ,
        render: function () {

        },
        cancel: function (event) {

        }
    });

    var minventarView = new MinventarView({el: $("#minventar")});
    var creationDialogView = new TypeCreationDialogView({el: $("#type-creation-dialog")});
})
;