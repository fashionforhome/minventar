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

use AppBundle\Controller\MinventarController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bridge\PhpUnit;

class MinventarControllerUnitTest extends \PHPUnit_Framework_TestCase
{

    public function testExtractResourceCriteriaFromRequest()
    {
        $client = new MinventarController();
        $request = new Request(['id' => '55cca3af981caca5c68377d7', 'name' => 'name']);
        $actual = $this->invokeMethod($client, 'extractResourceCriteriaFromRequest', [$request]);
        $expected = ['_id' => new \MongoId('55cca3af981caca5c68377d7'), 'name' => 'name'];
        $this->assertEquals($expected, $actual);
    }

    public function testExtractResourceTypeCriteriaFromRequest()
    {
        $client = new MinventarController();
        $request = new Request(['id' => '55cca3af981caca5c68377d7', 'name' => 'name', 'is_bundle' => true]);
        $actual = $this->invokeMethod($client, 'extractResourceTypeCriteriaFromRequest', [$request]);
        $expected = ['_id' => new \MongoId('55cca3af981caca5c68377d7'), 'name' => 'name', 'is_bundle' => true];
        $this->assertEquals($expected, $actual);
    }

    private function invokeMethod(&$object, $methodName, array $parameters = array())
    {
        $reflection = new \ReflectionClass(get_class($object));
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);

        return $method->invokeArgs($object, $parameters);
    }

}