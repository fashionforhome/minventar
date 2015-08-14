<?php
/**
 * Created by PhpStorm.
 * User: Daniel Schulz
 * Date: 12.08.2015
 * Time: 11:15
 */

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use Symfony\Component\HttpFoundation\JsonResponse;


use Mandango\Cache\FilesystemCache;
use Mandango\Connection;
use Mandango\Mandango;
use Model\Mapping as Mapping;

/**
 * Class MinventarController
 *
 * Controller class for the Minventar backend service.
 *
 * @package AppBundle\Controller
 */
class MinventarController extends Controller
{

    /**
     * @var the Mandango object
     */
    private $mandango;

    /**
     * Initializes the Mandango object.
     */
    public function init()
    {
        $configuration = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/../app/config/minventar.ini");

        $metadataFactory = new Mapping\MetadataFactory();
        $cache = new FilesystemCache($_SERVER['DOCUMENT_ROOT'] . "/../app/Resources/mongocache");
        $this->mandango = new Mandango($metadataFactory, $cache);
        $connection = new Connection($configuration['mongo_connection_string'], $configuration['mongo_database_name']);
        $this->mandango->setConnection('my_connection', $connection);
        $this->mandango->setDefaultConnectionName('my_connection');
    }

    /**
     * Service method to get all resources. Can be filtered by id, name and/or type via URL parameters.
     *
     * e.g.: ?id=55cb0842a0416ebac6ac6797&name=Example&type=55cb0842a0416ebac6ac6796
     *
     * @Route("/minventar/api/resources")
     * @Method("GET")
     */
    public function getAllResourcesAction(Request $request)
    {
        $this->init();

        $id = $request->query->get('id');
        $mongoId = new \MongoId($id);
        $name = $request->query->get('name');
        $type = $request->query->get('type');
        $mongoType = new \MongoId($type);

        $criteria = array();

        if ($id != null) {
            $criteria['_id'] = $mongoId;
        }
        if ($name != null) {
            $criteria['name'] = $name;
        }
        if ($type != null) {
            $criteria['type'] = $mongoType;
        }

        $resourceRepository = $this->mandango->getRepository('Model\Resource');

        $resources = $resourceRepository->createQuery()->criteria($criteria)->all();
        return new JsonResponse(static::convertMandagoDocumentsToArray($resources));
    }

    /**
     * Service method to get all resource types. Can be filtered by id, name and/or bundle/notBundle via URL parameters.
     *
     * e.g.: ?id=55cb0842a0416ebac6ac6797&name=Example&is_bundle=true
     *
     * @Route("/minventar/api/resource_types")
     * @Method("GET")
     */
    public function getAllResourceTypesAction(Request $request)
    {
        $this->init();

        $id = $request->query->get('id');
        $mongoId = new \MongoId($id);
        $name = $request->query->get('name');
        $isBundle = $request->query->get('is_bundle');

        $criteria = array();

        if ($id != null) {
            $criteria['_id'] = $mongoId;
        }
        if ($name != null) {
            $criteria['name'] = $name;
        }
        if ($isBundle == 'true' || $isBundle == 'false') {
            $criteria['is_bundle'] = $isBundle == 'true' ? true : false;
        }


        $resourceTypeRepository = $this->mandango->getRepository('Model\ResourceType');

        $resourceTypes = $resourceTypeRepository->createQuery()->criteria($criteria)->all();


        return new JsonResponse(static::convertMandagoDocumentsToArray($resourceTypes));
    }

    /**
     * Service method to delete a single resource.
     *
     * @Route("/minventar/api/resources/{id}")
     * @Method("DELETE")
     */
    public function deleteResourcesAction(Request $request, $id)
    {
        $this->init();

        $resourceRepository = $this->mandango->getRepository('Model\Resource');

        $resource = $resourceRepository->findOneById($id);
        if ($resource != null) {
            $resourceRepository->delete($resource);
            return new Response();
        } else {
            $response = new Response();
            $response->setStatusCode(Response::HTTP_NOT_FOUND);
            return $response;
        }
    }

    /**
     * Service method to delete a single resource type.
     *
     * @Route("/minventar/api/resource_types/{id}")
     * @Method("DELETE")
     */
    public function deleteResourceTypeAction(Request $request, $id)
    {
        $this->init();

        $resourceTypeRepository = $this->mandango->getRepository('Model\ResourceType');

        $resource = $resourceTypeRepository->findOneById($id);
        if ($resource != null) {
            $resourceTypeRepository->delete($resource);
            return new Response();
        } else {
            $response = new Response();
            $response->setStatusCode(Response::HTTP_NOT_FOUND);
            return $response;
        }
    }

    /**
     * Service method to create a single resource via post request. Automatically generates a new MongoID. Returns the created resource.
     *
     * e.g.: {"name":"Example1","type":"55cb0842a0416ebac6ac6797","attributes":[{"name":"name","value":"Example"},{"name":"number","value":"1"}],"resources":[]}
     *
     * @Route("/minventar/api/resources")
     * @Method("POST")
     */
    public function createResourceAction(Request $request)
    {
        $this->init();

        $input = json_decode((string)$request->getContent(), true);
        $resource = $this->mandango->create('Model\Resource');

        $name = $input['name'];

        $resource->setName($name);

        $typeID = $input['type'];
        $type = $this->mandango->getRepository('Model\ResourceType')->findOneById($typeID);
        $resource->setType($type);

        $attributesIn = $input['attributes'];
        $attributes = $resource->getAttributes();

        foreach ($attributesIn as $attributeIn) {
            $attribute = $this->mandango->create('Model\Attribute');
            $attribute->setName($attributeIn['name']);
            $attribute->setValue($attributeIn['value']);
            $attributes->add($attribute);
        }


        $innerResourcesIDs = $input['resources'];

        if (!empty($innerResourcesIDs)) {
            $innerResources = $resource->getResources();
            $resourceRepository = $this->mandango->getRepository('Model\Resource');
            foreach ($innerResourcesIDs as $innerResourcesID) {
                $innerResource = $resourceRepository->findOneById($innerResourcesID);
                $innerResources->add($innerResource);
            }
        }

        $resource->save();

        return new JsonResponse($resource->toArray());
    }

    /**
     * Service method to create a single resource type via post request. Automatically generates a new MongoID. Returns the created resource type.
     *
     * e.g.: {"name":"ExampleType","is_bundle":false,"attributes":[{"name":"name","type":"String"},{"name":"number","type":"Number"}]}
     *
     * @Route("/minventar/api/resource_types")
     * @Method("POST")
     */
    public function createResourceTypeAction(Request $request)
    {
        $this->init();

        $input = json_decode((string)$request->getContent(), true);
        $resourceType = $this->mandango->create('Model\ResourceType');

        $name = $input['name'];

        $resourceType->setName($name);

        $isBundle = $input['is_bundle'];
        $resourceType->setIs_bundle($isBundle);

        $attributesIn = $input['attributes'];
        $attributes = $resourceType->getAttributes();

        foreach ($attributesIn as $attributeIn) {
            $attribute = $this->mandango->create('Model\AttributeType');
            $attribute->setName($attributeIn['name']);
            $attribute->setType($attributeIn['type']);
            $attributes->add($attribute);
        }


        $resourceType->save();

        return new JsonResponse($resourceType->toArray());
    }

    /**
     * Calls the toArray() function for all elements of an one dimensional array of Resources/ResourceTypes and merges the results into a single array.
     * @param $documents
     * @return array
     */
    private static function convertMandagoDocumentsToArray($documents)
    {
        $result = array();

        foreach ($documents as $object) {
            array_push($result, $object->toArray());
        }

        return $result;
    }


}
