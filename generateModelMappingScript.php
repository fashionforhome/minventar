<?php

require_once __DIR__ . "/vendor/autoload.php";

use Mandango\Mondator\Mondator;

$modelDir = __DIR__ . "/app/Resources/Model";

$mondator = new Mondator();
//TODO define mongo collections
// assign the config classes
$mondator->setConfigClasses(array(
    'Model\Resource' => array(
        'fields' => array(
            'title' => 'string',
            'content' => 'string',
        ),
    ), 'Model\ResourceType' => array(
        'fields' => array(
            'title' => 'string',
            'content' => 'string',
        ),
    )
));

// assign extensions
$mondator->setExtensions(array(
    new Mandango\Extension\Core(array(
        'metadata_factory_class' => 'Model\Mapping\MetadataFactory',
        'metadata_factory_output' => $modelDir . '/Mapping',
        'default_output' => $modelDir,
    )),
));

// process
$mondator->process();