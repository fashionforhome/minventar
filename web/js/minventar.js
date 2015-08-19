/**
 * Created by Daniel Schulz on 18.08.2015.
 */
$(document).ready(function () {
    var ControllBarView = Backbone.View.extend({

            isTypeMode: false,
            isCreationDialogOpen: false,

            events: {
                "click #creation-button": "showCreationDialog",
                "click #resources-type-radio": "switchToTypeMode",
                "click #resources-radio": "switchToResourceMode"
            }
            ,

            initialize: function () {
                this.render();
            }
            ,
            render: function () {

            },
            switchToTypeMode: function (event) {
                if (!this.isTypeMode) {
                    this.$el.find("#creation-button").html("Create resource type");
                    $("#heading").text("Resource types");
                    this.isTypeMode = true;
                }
            }, switchToResourceMode: function (event) {
                if (this.isTypeMode) {
                    this.$el.find("#creation-button").html("Create resource");
                    $("#heading").text("Resources");
                    this.isTypeMode = false;
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
                    $("#creation-dialog").css("visibility", "visible");
                }
            },
            showTypeCreationDialog: function () {
                //var theTemplateScript = "{{#list books}}{{link}}{{bookName}}{{authorName}}{{/list}}";
                //var creationDialogTemplate = Handlebars.compile(theTemplateScript);
                //$("#creation-dialog").html(creationDialogTemplate());

                //TODO Template generieren mit add attributes Name/type....
                this.isCreationDialogOpen = true;
            },
            showResourceCreationDialog: function () {
                //TODO Template generieren mit add alle attributesdes typs
                this.isCreationDialogOpen = true;
            }
        }
    );

    var CreationDialogView = Backbone.View.extend({});

    var controllBarView = new ControllBarView({el: $("#control-bar")});
    var creationDialogView = new CreationDialogView({el: $("#creation-dialog")});
})
;