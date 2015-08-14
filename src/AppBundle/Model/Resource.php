<?php

namespace Model;

/**
 * Model\Resource document.
 */
class Resource extends \Model\Base\Resource
{

    public function toArray($withReferenceFields = false)
    {
        $result = array();
        $result['id'] = (string)$this->getId();
        $result['name'] = $this->getName();
        $result['type'] = (string)$this->getType()->getId();
        $attributes = array();

        foreach ($this->getAttributes()->all() as $attribute) {
            array_push($attributes, $attribute->toArray());
        }

        $result['attributes'] = $attributes;


        $resources = array();
        foreach ($this->getResources()->all() as $resource) {
            array_push($resources, (string)$resource->getID());
        }
        $result['resources'] = $resources;

        return $result;
    }

}