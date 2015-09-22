/**
 * This file is part of Minventar.
 *
 * @category inventory software
 * @package Minventar_Frontend
 *
 * @author Daniel Schulz <daniel.schulz@fashion4home.de>
 *
 * @copyright (c) 2015 by fashion4home GmbH <www.fashionforhome.de>
 * @license GPL-3.0
 * @license http://opensource.org/licenses/GPL-3.0 GNU GENERAL PUBLIC LICENSE
 *
 * @version 0.1.0
 *
 * Date: 22.09.2015
 * Time: 14:10
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