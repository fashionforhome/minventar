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
//use Symfony\Component\HttpFoundation\JsonResponse;
//use Mandango\Mondator\Mondator;

//use Symfony\Component\ClassLoader\UniversalClassLoader;
use Mandango\Cache\FilesystemCache;
use Mandango\Connection;
use Mandango\Mandango;
use Model\Mapping as Mapping;



class MinventarController extends Controller
{
    /**
     * @Route("/minventar/api/resources")
     * @Method("GET")
     */
    public function indexAction(Request $request)
    {


        $metadataFactory = new Mapping\MetadataFactory();
        $cache = new FilesystemCache('/path/to/query/cache/dir');
        $mandango = new Mandango($metadataFactory, $cache);
        $connection = new Connection('mongodb://localhost:27017', 'minventar');
        $mandango->setConnection('my_connection', $connection);

        return new Response("test");
    }

}