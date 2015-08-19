<?php
namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class MinventarFrontendController extends Controller
{
    /**
     * @Route("/minventar")
     * @Method("GET")
     */
    public function showAction()
    {
//        return new Response(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/../app/Resources/views/minventar.html'));


        return $this->render('minventar.html');
    }

}