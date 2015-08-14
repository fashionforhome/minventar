<?php

namespace Model;

/**
 * Model\ResourceType document.
 */
class ResourceType extends \Model\Base\ResourceType
{

    public function toArray($withReferenceFields = false)
    {
        $result = array();
        $result['id'] = (string)$this->getId();
        $result['name'] = $this->getName();
        $result['is_bundle'] = $this->getIs_bundle();
        $attributes = array();

        foreach ($this->getAttributes()->all() as $attribute) {
            array_push($attributes, $attribute->toArray());
        }

        $result['attributes'] = $attributes;
        return $result;
    }

}