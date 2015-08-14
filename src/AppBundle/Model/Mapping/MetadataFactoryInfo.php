<?php

namespace Model\Mapping;

class MetadataFactoryInfo
{
    public function getModelAttributeClass()
    {
        return array(
            'isEmbedded' => true,
            'inheritable' => false,
            'inheritance' => false,
            'fields' => array(
                'name' => array(
                    'type' => 'string',
                    'dbName' => 'name',
                ),
                'value' => array(
                    'type' => 'string',
                    'dbName' => 'value',
                ),
            ),
            '_has_references' => false,
            'referencesOne' => array(

            ),
            'referencesMany' => array(

            ),
            'embeddedsOne' => array(

            ),
            'embeddedsMany' => array(

            ),
            'indexes' => array(

            ),
            '_indexes' => array(

            ),
        );
    }

    public function getModelAttributeTypeClass()
    {
        return array(
            'isEmbedded' => true,
            'inheritable' => false,
            'inheritance' => false,
            'fields' => array(
                'name' => array(
                    'type' => 'string',
                    'dbName' => 'name',
                ),
                'type' => array(
                    'type' => 'string',
                    'dbName' => 'type',
                ),
            ),
            '_has_references' => false,
            'referencesOne' => array(

            ),
            'referencesMany' => array(

            ),
            'embeddedsOne' => array(

            ),
            'embeddedsMany' => array(

            ),
            'indexes' => array(

            ),
            '_indexes' => array(

            ),
        );
    }

    public function getModelResourceClass()
    {
        return array(
            'isEmbedded' => false,
            'mandango' => null,
            'connection' => '',
            'collection' => 'resource',
            'inheritable' => false,
            'inheritance' => false,
            'fields' => array(
                'name' => array(
                    'type' => 'string',
                    'dbName' => 'name',
                ),
                'type_reference_field' => array(
                    'type' => 'raw',
                    'dbName' => 'type',
                    'referenceField' => true,
                ),
                'resources_reference_field' => array(
                    'type' => 'raw',
                    'dbName' => 'resources',
                    'referenceField' => true,
                ),
            ),
            '_has_references' => true,
            'referencesOne' => array(
                'type' => array(
                    'class' => 'Model\\ResourceType',
                    'field' => 'type_reference_field',
                ),
            ),
            'referencesMany' => array(
                'resources' => array(
                    'class' => 'Model\\Resource',
                    'field' => 'resources_reference_field',
                ),
            ),
            'embeddedsOne' => array(

            ),
            'embeddedsMany' => array(
                'attributes' => array(
                    'class' => 'Model\\Attribute',
                ),
            ),
            'relationsOne' => array(

            ),
            'relationsManyOne' => array(

            ),
            'relationsManyMany' => array(

            ),
            'relationsManyThrough' => array(

            ),
            'indexes' => array(

            ),
            '_indexes' => array(

            ),
        );
    }

    public function getModelResourceTypeClass()
    {
        return array(
            'isEmbedded' => false,
            'mandango' => null,
            'connection' => '',
            'collection' => 'resource_type',
            'inheritable' => false,
            'inheritance' => false,
            'fields' => array(
                'name' => array(
                    'type' => 'string',
                    'dbName' => 'name',
                ),
                'is_bundle' => array(
                    'type' => 'boolean',
                    'dbName' => 'is_bundle',
                ),
            ),
            '_has_references' => false,
            'referencesOne' => array(

            ),
            'referencesMany' => array(

            ),
            'embeddedsOne' => array(

            ),
            'embeddedsMany' => array(
                'attributes' => array(
                    'class' => 'Model\\AttributeType',
                ),
            ),
            'relationsOne' => array(

            ),
            'relationsManyOne' => array(

            ),
            'relationsManyMany' => array(

            ),
            'relationsManyThrough' => array(

            ),
            'indexes' => array(

            ),
            '_indexes' => array(

            ),
        );
    }
}