<?php

namespace Model\Mapping;

class MetadataFactory extends \Mandango\MetadataFactory
{
    protected $classes = array(
        'Model\\Attribute' => true,
        'Model\\AttributeType' => true,
        'Model\\Resource' => false,
        'Model\\ResourceType' => false,
    );
}