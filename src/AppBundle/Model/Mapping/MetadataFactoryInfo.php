<?php

namespace Model\Mapping;

class MetadataFactoryInfo
{
    public function getModelArticleClass()
    {
        return array(
            'isEmbedded' => false,
            'mandango' => null,
            'connection' => '',
            'collection' => 'model_article',
            'inheritable' => false,
            'inheritance' => false,
            'fields' => array(
                'title' => array(
                    'type' => 'string',
                    'dbName' => 'title',
                ),
                'content' => array(
                    'type' => 'string',
                    'dbName' => 'content',
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