<?php
echo $_SERVER['DOCUMENT_ROOT'] . "/vendor/autoload.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/vendor/autoload.php";

use Mandango\Mondator\Mondator;

$modelDir = $_SERVER['DOCUMENT_ROOT'] . "/src/AppBundle/Model";

$mondator = new Mondator();

$mondator->setConfigClasses(array(
    'Model\Attribute' => array(
        'isEmbedded' => true,
        'fields' => array(
            'name' => 'string',
            'value' => 'string',
        ),
    ),
    'Model\AttributeType' => array(
        'isEmbedded' => true,
        'fields' => array(
            'name' => 'string',
            'type' => 'string',
        ),
    ),
    'Model\Resource' => array(
        'collection' => 'resource',
        'fields' => array(
            'name' => 'string',
        ),
        'referencesOne' => array(
            'type' => array('class' => 'Model\ResourceType'),
        ),
        'embeddedsMany' => array(
            'attributes' => array('class' => 'Model\Attribute'),
        ),
        'referencesMany' => array(
            'resources' => array('class' => 'Model\Resource'),
        ),

    ), 'Model\ResourceType' => array(
        'collection' => 'resource_type',
        'fields' => array(
            'name' => 'string',
            'is_bundle' => 'boolean',
        ), 'embeddedsMany' => array(
            'attributes' => array('class' => 'Model\AttributeType'),
        ),
    )
));

$mondator->setExtensions(array(
    new Mandango\Extension\Core(array(
        'metadata_factory_class' => 'Model\Mapping\MetadataFactory',
        'metadata_factory_output' => $modelDir . '/Mapping',
        'default_output' => $modelDir,
    )),
));

$mondator->process();