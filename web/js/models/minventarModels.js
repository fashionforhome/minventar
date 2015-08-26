/**
 * Created by Daniel Schulz on 21.08.2015.
 *
 * Contains all Backbone Models of the Minventar.
 */

/**
 * Model containing a single resource type.
 */
var ResourceType = Backbone.Model.extend({
    urlRoot: "minventar/api/resource_types",
    id: "",
    name: "",
    is_bundle: "",
    attributes: [],
    initialize: function () {
    }
});

/**
 * Collection containing multiple resource types.
 */
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

/**
 * Model containing a single resource.
 */
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

/**
 * Collection containing multiple resources
 */
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