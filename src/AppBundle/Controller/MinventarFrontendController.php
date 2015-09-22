<?php

/**
 * This file is part of Minventar.
 *
 * @category inventory software
 * @package Minventar_Frontend
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