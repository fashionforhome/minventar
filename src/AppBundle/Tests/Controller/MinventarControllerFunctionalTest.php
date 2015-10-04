<?php

/**
 * This file is part of Minventar.
 *
 * @category inventory software
 * @package Minventar_Service
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

namespace AppBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use MongoClient;
use MongoId;

/**
 * Used test data:
 *
 * id                       name
 * 55cb097da0416ebac6ac6798 Test
 * 55cca3af981caca5c68377d7 TestBundle
 *
 * 55cb0842a0416ebac6ac6797 TestType
 * 55cca32d981caca5c68377d6 TestBundleType
 *
 *
 * Class MinventarControllerTest
 * @package AppBundle\Tests\Controller
 */
class MinventarControllerFunctionalTest extends WebTestCase
{

    public function testGetAllResourcesWithoutFilters()
    {
        $this->setUpTestData();
        $client = static::createClient();

        $client->request('GET', '/minventar/api/resources');


        $actual = json_decode($client->getResponse()->getContent(), true);
        $expected = array(array('id' => '55cb097da0416ebac6ac6798', 'name' => 'Test', 'type' => '55cb0842a0416ebac6ac6797', 'attributes' => array(array('name' => 'color', 'value' => 'orange')), 'resources' => array()),
            array('id' => '55cca3af981caca5c68377d7', 'name' => 'TestBundle', 'type' => '55cca32d981caca5c68377d6', 'attributes' => array(array('name' => 'size', 'value' => 'medium')), 'resources' => array('55cb097da0416ebac6ac6798')));


        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertEquals($expected, $actual);
    }

    public function testGetAllResourcesWithFilters()
    {
        $this->setUpTestData();
        $client = static::createClient();

        $client->request('GET', '/minventar/api/resources', array('name' => 'TestBundle', 'type' => '55cca32d981caca5c68377d6'));


        $actual = json_decode($client->getResponse()->getContent(), true);
        $expected = array(array('id' => '55cca3af981caca5c68377d7', 'name' => 'TestBundle', 'type' => '55cca32d981caca5c68377d6', 'attributes' => array(array('name' => 'size', 'value' => 'medium')), 'resources' => array('55cb097da0416ebac6ac6798')));


        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertEquals($expected, $actual);
    }

    public function testGetAllResourceTypesWithoutFilters()
    {
        $this->setUpTestData();
        $client = static::createClient();

        $client->request('GET', '/minventar/api/resource_types');


        $actual = json_decode($client->getResponse()->getContent(), true);
        $expected = array(array('id' => '55cb0842a0416ebac6ac6797', 'name' => 'TestType', 'is_bundle' => false, 'attributes' => array(array('name' => 'color', 'type' => 'String'))),
            array('id' => '55cca32d981caca5c68377d6', 'name' => 'TestBundleType', 'is_bundle' => true, 'attributes' => array(array('name' => 'size', 'type' => 'String'))));


        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertEquals($expected, $actual);
    }

    public function testGetAllResourceTypesWithFilters()
    {
        $this->setUpTestData();
        $client = static::createClient();

        $client->request('GET', '/minventar/api/resource_types', array('is_bundle' => true));


        $actual = json_decode($client->getResponse()->getContent(), true);
        $expected = array(array('id' => '55cca32d981caca5c68377d6', 'name' => 'TestBundleType', 'is_bundle' => true, 'attributes' => array(array('name' => 'size', 'type' => 'String'))));


        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertEquals($expected, $actual);
    }

    public function testDeleteUsedResource()
    {
        $this->setUpTestData();

        $client = static::createClient();
        $client->request('DELETE', '/minventar/api/resources/55cb097da0416ebac6ac6798');

        $this->assertEquals(400, $client->getResponse()->getStatusCode());
    }

    public function testDeleteUnusedResource()
    {
        $this->setUpTestData();

        $client = static::createClient();
        $client->request('DELETE', '/minventar/api/resources/55cca3af981caca5c68377d7');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $client->request('GET', '/minventar/api/resources');


        $actual = json_decode($client->getResponse()->getContent(), true);
        $expected = array(array('id' => '55cb097da0416ebac6ac6798', 'name' => 'Test', 'type' => '55cb0842a0416ebac6ac6797', 'attributes' => array(array('name' => 'color', 'value' => 'orange')), 'resources' => array()));


        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertEquals($expected, $actual);
    }

    public function testDeleteUsedResourceType()
    {
        $this->setUpTestData();

        $client = static::createClient();
        $client->request('DELETE', '/minventar/api/resource_types/55cb0842a0416ebac6ac6797');

        $this->assertEquals(400, $client->getResponse()->getStatusCode());
    }

    public function testDeleteUnusedResourceType()
    {
        $this->setUpTestData();

        $client = static::createClient();

        //delete resource of this type
        $client->request('DELETE', '/minventar/api/resources/55cca3af981caca5c68377d7');
        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        //delete type itself
        $client->request('DELETE', '/minventar/api/resource_types/55cca32d981caca5c68377d6');
        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $client->request('GET', '/minventar/api/resource_types');

        $actual = json_decode($client->getResponse()->getContent(), true);
        $expected = array(array('id' => '55cb0842a0416ebac6ac6797', 'name' => 'TestType', 'is_bundle' => false, 'attributes' => array(array('name' => 'color', 'type' => 'String'))));


        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertEquals($expected, $actual);
    }

    public function testCreateResource()
    {
        $this->setUpTestData();

        $client = static::createClient();

        $content = json_encode(array('name' => 'CreatedTest', 'type' => '55cb0842a0416ebac6ac6797', 'attributes' => array(array('name' => 'material', 'value' => 'stone'))));


        $client->request('POST', '/minventar/api/resources', array(), array(), array(), $content, true);

        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $actual = json_decode($client->getResponse()->getContent(), true);

        $mongo = new MongoClient($client->getContainer()->getParameter('mongo_connection_string'));
        $dbName = ($client->getContainer()->getParameter('mongo_database_name'));
        $db = $mongo->$dbName;
        $resourceColl = $db->selectCollection("resource");
        $id = $resourceColl->find(array('name' => 'CreatedTest'), ['id'])->getNext()['_id'];
        $expected = array('id' => (string)$id, 'name' => 'CreatedTest', 'type' => '55cb0842a0416ebac6ac6797', 'attributes' => array(array('name' => 'material', 'value' => 'stone')), 'resources' => array());


        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertEquals($expected, $actual);
    }

    public function testCreateResourceType()
    {
        $this->setUpTestData();

        $client = static::createClient();

        $content = json_encode(array('name' => 'CreatedTestType', 'is_bundle' => false, 'attributes' => array(array('name' => 'material', 'type' => 'String'))));

        $client->request('POST', '/minventar/api/resource_types', array(), array(), array(), $content, true);

        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $actual = json_decode($client->getResponse()->getContent(), true);

        $mongo = new MongoClient($client->getContainer()->getParameter('mongo_connection_string'));
        $dbName = ($client->getContainer()->getParameter('mongo_database_name'));
        $db = $mongo->$dbName;
        $resourceTypeColl = $db->selectCollection("resource_type");
        $id = $resourceTypeColl->find(array('name' => 'CreatedTestType'), ['id'])->getNext()['_id'];
        $expected = array('id' => (string)$id, 'name' => 'CreatedTestType', 'is_bundle' => false, 'attributes' => array(array('name' => 'material', 'type' => 'String')));


        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertEquals($expected, $actual);
    }

    public function  testRemoveAndAddResourcesFromBundle()
    {
        $this->setUpTestData();

        $client = static::createClient();


        $client->request('PATCH', '/minventar/api/resources/55cca3af981caca5c68377d7/rmv/55cb097da0416ebac6ac6798');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $actual = json_decode($client->getResponse()->getContent(), true);

        $expected = array('id' => '55cca3af981caca5c68377d7', 'name' => 'TestBundle', 'type' => '55cca32d981caca5c68377d6', 'attributes' => array(array('name' => 'size', 'value' => 'medium')), 'resources' => array());
        $this->assertEquals($expected, $actual);
        $client->request('PATCH', '/minventar/api/resources/55cca3af981caca5c68377d7/add/55cb097da0416ebac6ac6798');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $actual = json_decode($client->getResponse()->getContent(), true);

        $expected = array('id' => '55cca3af981caca5c68377d7', 'name' => 'TestBundle', 'type' => '55cca32d981caca5c68377d6', 'attributes' => array(array('name' => 'size', 'value' => 'medium')), 'resources' => array('55cb097da0416ebac6ac6798'));
        $this->assertEquals($expected, $actual);
    }

    public function  testUpdateResource()
    {
        $this->setUpTestData();

        $client = static::createClient();

        $content = json_encode(array('name' => 'UpdatedTest', 'type' => '55cb0842a0416ebac6ac6797', 'attributes' => array(array('name' => 'color', 'value' => 'Red'))));

        $client->request('PUT', '/minventar/api/resources/55cb097da0416ebac6ac6798', array(), array(), array(), $content, true);

        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $actual = json_decode($client->getResponse()->getContent(), true);

        $expected = array('id' => '55cb097da0416ebac6ac6798', 'name' => 'UpdatedTest', 'type' => '55cb0842a0416ebac6ac6797', 'attributes' => array(array('name' => 'color', 'value' => 'Red')), 'resources' => array());

        $this->assertEquals($expected, $actual);
    }

    public function  testUpdateResourceType()
    {
        $this->setUpTestData();

        $client = static::createClient();

        $content = json_encode(array('name' => 'UpdatedTestType'));

        $client->request('PUT', '/minventar/api/resource_types/55cb0842a0416ebac6ac6797', array(), array(), array(), $content, true);

        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $actual = json_decode($client->getResponse()->getContent(), true);

        $expected = array('id' => '55cb0842a0416ebac6ac6797', 'name' => 'UpdatedTestType', 'is_bundle' => false, 'attributes' => array(array('name' => 'color', 'type' => 'String')));

        $this->assertEquals($expected, $actual);
    }


    private function setUpTestData()
    {
        $client = static::createClient();
        $mongo = new MongoClient($client->getContainer()->getParameter('mongo_connection_string'));
        $dbName = ($client->getContainer()->getParameter('mongo_database_name'));
        $db = $mongo->$dbName;

        $this->cleanUpTestData($db);

        $resourceColl = $db->createCollection("resource");
        $resourceTypeColl = $db->createCollection("resource_type");

        $resourceTypeColl->insert(array('_id' => new MongoId('55cb0842a0416ebac6ac6797'), 'name' => 'TestType', 'is_bundle' => false, 'attributes' => array(array('name' => 'color', 'type' => 'String'))));
        $resourceTypeColl->insert(array('_id' => new MongoId('55cca32d981caca5c68377d6'), 'name' => 'TestBundleType', 'is_bundle' => true, 'attributes' => array(array('name' => 'size', 'type' => 'String'))));

        $resourceColl->insert(array('_id' => new MongoId('55cb097da0416ebac6ac6798'), 'name' => 'Test', 'type' => new MongoId('55cb0842a0416ebac6ac6797'), 'attributes' => array(array('name' => 'color', 'value' => 'orange'))));
        $resourceColl->insert(array('_id' => new MongoId('55cca3af981caca5c68377d7'), 'name' => 'TestBundle', 'type' => new MongoId('55cca32d981caca5c68377d6'), 'attributes' => array(array('name' => 'size', 'value' => 'medium')), 'resources' => array(new MongoId('55cb097da0416ebac6ac6798'))));
    }

    private function  cleanUpTestData($db)
    {
        $resourceColl = $db->selectCollection("resource");
        $resourceTypeColl = $db->selectCollection("resource_type");
        $resourceColl->drop();
        $resourceTypeColl->drop();
    }

}
