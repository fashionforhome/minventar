<?php
/**
 * Created by PhpStorm.
 * User: Daniel Schulz
 * Date: 17.08.2015
 * Time: 16:24
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