<?php
/**
 * Created by PhpStorm.
 * User: Daniel Schulz
 * Date: 12.08.2015
 * Time: 11:15
 */

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class MyController extends Controller
{
    /**
     * @Route("/{name}")
     */
    public function indexAction(Request $request, $name)
    {
        // replace this example code with whatever you need
        return new Response($name);
    }

}