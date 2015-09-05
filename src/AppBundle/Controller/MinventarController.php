<?php

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
        //create the mongo collections if they don't exist already
        $mongoClient = new \MongoClient($this->container->getParameter('mongo_connection_string'));
        $mongoClient->selectDB($this->container->getParameter('mongo_database_name'))->createCollection("resource");
        $mongoClient->selectDB($this->container->getParameter('mongo_database_name'))->createCollection("resource_type");


        $metadataFactory = new Mapping\MetadataFactory();
        $cache = new FilesystemCache($this->get('kernel')->getRootDir() . "/Resources/mongocache");
        $this->mandango = new Mandango($metadataFactory, $cache);
        $connection = new Connection($this->container->getParameter('mongo_connection_string'), $this->container->getParameter('mongo_database_name'));
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
     * @return a JSON containing the requested resources
     */
    public function getAllResourcesAction(Request $request)
    {
        $this->init();

        $criteria = self::extractResourceCriteriaFromRequest($request);
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
     * @return a JSON containing the requested resource types
     */
    public function getAllResourceTypesAction(Request $request)
    {
        $this->init();

        $criteria = $this->extractResourceTypeCriteriaFromRequest($request);
        $resourceTypeRepository = $this->mandango->getRepository('Model\ResourceType');
        $resourceTypes = $resourceTypeRepository->createQuery()->criteria($criteria)->all();

        return new JsonResponse(static::convertMandagoDocumentsToArray($resourceTypes));
    }

    /**
     * Service method to delete a single resource. A resource can only be deleted if there is no bundle containing it.
     *
     * @Route("/minventar/api/resources/{id}")
     * @Method("DELETE")
     * @return Status 200 if a resource was deleted, Status 404 if the resource wasn't found or Status 400 if the resource is still contained in a bundle
     */
    public function deleteResourcesAction(Request $request, $id)
    {
        $this->init();

        $resourceRepository = $this->mandango->getRepository('Model\Resource');

        $criteria = array();
        $criteria['resources'] = new \MongoId($id);

        $bundles = $resourceRepository->createQuery()->criteria($criteria)->all();

        //if this resources is not contained by any bundle
        if (empty($bundles)) {
            $resource = $resourceRepository->findOneById($id);
            if ($resource != null) {
                $resourceRepository->delete($resource);
                return new Response();
            } else {
                $response = new Response();
                $response->setStatusCode(Response::HTTP_NOT_FOUND);
                return $response;
            }
        } else {
            $response = new Response();
            $response->setStatusCode(Response::HTTP_BAD_REQUEST);
            $response->setContent("Requested resource is still being used.");
            return $response;
        }
    }

    /**
     * Service method to delete a single resource type. A resource type can only be deleted if there are now resources with this type.
     *
     * @Route("/minventar/api/resource_types/{id}")
     * @Method("DELETE")
     * @return Status 200 if a resource type was deleted, Status 404 if the resource type wasn't found or Status 400 if the type is still in use
     */
    public function deleteResourceTypeAction(Request $request, $id)
    {
        $this->init();

        $resourceRepository = $this->mandango->getRepository('Model\Resource');

        $criteria = array();
        $criteria['type'] = new \MongoId($id);

        $resources = $resourceRepository->createQuery()->criteria($criteria)->all();

        //if no resources has the requested type
        if (empty($resources)) {
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
        } else {
            $response = new Response();
            $response->setStatusCode(Response::HTTP_BAD_REQUEST);
            $response->setContent("Requested type is still being used.");
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
     * @return the created resource
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
        if (isset($input['resources'])) {
            $innerResourcesIDs = $input['resources'];
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
     * @return the created resource type
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
     * Adds a resource to a bundle.
     * @Route("/minventar/api/resources/{bundle}/add/{resource}")
     * @Method("PATCH")
     */
    public function addResourceToBundleAction(Request $request, $bundle, $resource)
    {
        $this->init();
        $resourceRepository = $this->mandango->getRepository('Model\Resource');
        $bundleDoc = $resourceRepository->findOneById(new \MongoId($bundle));
        $resources = $bundleDoc->getResources();
        $resources->add($resourceRepository->findOneById(new \MongoId($resource)));
        $bundleDoc->save();
        return new JsonResponse($bundleDoc->toArray());

    }

    /**
     * Removes a resource from a bundle.
     * @Route("/minventar/api/resources/{bundle}/rmv/{resource}")
     * @Method("PATCH")
     */
    public function removeResourceFromBundleAction(Request $request, $bundle, $resource)
    {
        $this->init();
        $resourceRepository = $this->mandango->getRepository('Model\Resource');
        $bundleDoc = $resourceRepository->findOneById(new \MongoId($bundle));
        $resources = $bundleDoc->getResources();
        $resources->remove($resourceRepository->findOneById(new \MongoId($resource)));
        $bundleDoc->save();
        return new JsonResponse($bundleDoc->toArray());
    }

    /**
     * Updates a resource completely.
     * @Route("/minventar/api/resources/{id}")
     * @Method("PUT")
     */
    public function updateResourceAction(Request $request, $id)
    {
        $this->init();

        $input = json_decode((string)$request->getContent(), true);
        $resourcesRepository = $this->mandango->getRepository('Model\Resource');


        $resource = $resourcesRepository->findOneById(new \MongoId($id));

        $name = $input['name'];

        $resource->setName($name);

        $typeID = $input['type'];
        $type = $this->mandango->getRepository('Model\ResourceType')->findOneById($typeID);
        $resource->setType($type);

        $attributesIn = $input['attributes'];
        $attributes = $resource->getAttributes();
        $i = 0;
        foreach ($attributes as $attributeOld) {
            $attributeOld->setName($attributesIn[$i]['name']);
            $attributeOld->setValue($attributesIn[$i]['value']);
            $i++;
        }
        if (isset($input['resources'])) {
            $innerResourcesIDs = $input['resources'];
            $innerResources = $resource->getResources();

            foreach ($innerResources as $innerResource) {
                $innerResources->remove($resourcesRepository->findOneById($innerResource->getId()));
                $resource->save();
            }


            foreach ($innerResourcesIDs as $innerResourcesID) {
                $innerResource = $resourcesRepository->findOneById($innerResourcesID);
                $innerResources->add($innerResource);
            }
        }
        $resource->save();
        $this->init();
        $resourcesRepository = $this->mandango->getRepository('Model\Resource');


        $resource = $resourcesRepository->findOneById(new \MongoId($id));
        return new JsonResponse($resource->toArray());
    }

    /**
     * Updates a resource type. Note: only the name of a type can be changed.
     * @Route("/minventar/api/resource_types/{id}")
     * @Method("PUT")
     */
    public function updateResourceTypeAction(Request $request, $id)
    {
        $this->init();

        $input = json_decode((string)$request->getContent(), true);
        $resourceTypeRepository = $this->mandango->getRepository('Model\ResourceType');


        $resourceType = $resourceTypeRepository->findOneById(new \MongoId($id));

        $name = $input['name'];
        $resourceType->setName($name);

        $resourceType->save();

        return new JsonResponse($resourceType->toArray());

    }


    /**
     * Extracts the criteria for a resource from a GET request.
     * @param Request $request
     * @return array associative array containing the criteria
     */
    private static function extractResourceCriteriaFromRequest(Request $request)
    {
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
            return $criteria;
        }
        return $criteria;
    }

    /**
     * Extracts the criteria for a resource type from a GET request.
     * @param Request $request
     * @return array associative array containing the criteria
     */
    private function extractResourceTypeCriteriaFromRequest(Request $request)
    {
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
            return $criteria;
        }
        return $criteria;
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
