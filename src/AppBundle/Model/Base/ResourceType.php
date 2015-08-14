<?php

namespace Model\Base;

/**
 * Base class of Model\ResourceType document.
 */
abstract class ResourceType extends \Mandango\Document\Document
{
    /**
     * Initializes the document defaults.
     */
    public function initializeDefaults()
    {
    }

    /**
     * Set the document data (hydrate).
     *
     * @param array $data  The document data.
     * @param bool  $clean Whether clean the document.
     *
     * @return \Model\ResourceType The document (fluent interface).
     */
    public function setDocumentData($data, $clean = false)
    {
        if ($clean) {
            $this->data = array();
            $this->fieldsModified = array();
        }

        if (isset($data['_query_hash'])) {
            $this->addQueryHash($data['_query_hash']);
        }
        if (isset($data['_id'])) {
            $this->setId($data['_id']);
            $this->setIsNew(false);
        }
        if (isset($data['name'])) {
            $this->data['fields']['name'] = (string) $data['name'];
        } elseif (isset($data['_fields']['name'])) {
            $this->data['fields']['name'] = null;
        }
        if (isset($data['is_bundle'])) {
            $this->data['fields']['is_bundle'] = (bool) $data['is_bundle'];
        } elseif (isset($data['_fields']['is_bundle'])) {
            $this->data['fields']['is_bundle'] = null;
        }
        if (isset($data['attributes'])) {
            $embedded = new \Mandango\Group\EmbeddedGroup('Model\AttributeType');
            $embedded->setRootAndPath($this, 'attributes');
            $embedded->setSavedData($data['attributes']);
            $this->data['embeddedsMany']['attributes'] = $embedded;
        }

        return $this;
    }

    /**
     * Set the "name" field.
     *
     * @param mixed $value The value.
     *
     * @return \Model\ResourceType The document (fluent interface).
     */
    public function setName($value)
    {
        if (!isset($this->data['fields']['name'])) {
            if (!$this->isNew()) {
                $this->getName();
                if ($this->isFieldEqualTo('name', $value)) {
                    return $this;
                }
            } else {
                if (null === $value) {
                    return $this;
                }
                $this->fieldsModified['name'] = null;
                $this->data['fields']['name'] = $value;
                return $this;
            }
        } elseif ($this->isFieldEqualTo('name', $value)) {
            return $this;
        }

        if (!isset($this->fieldsModified['name']) && !array_key_exists('name', $this->fieldsModified)) {
            $this->fieldsModified['name'] = $this->data['fields']['name'];
        } elseif ($this->isFieldModifiedEqualTo('name', $value)) {
            unset($this->fieldsModified['name']);
        }

        $this->data['fields']['name'] = $value;

        return $this;
    }

    /**
     * Returns the "name" field.
     *
     * @return mixed The $name field.
     */
    public function getName()
    {
        if (!isset($this->data['fields']['name'])) {
            if ($this->isNew()) {
                $this->data['fields']['name'] = null;
            } elseif (!isset($this->data['fields']) || !array_key_exists('name', $this->data['fields'])) {
                $this->addFieldCache('name');
                $data = $this->getRepository()->getCollection()->findOne(array('_id' => $this->getId()), array('name' => 1));
                if (isset($data['name'])) {
                    $this->data['fields']['name'] = (string) $data['name'];
                } else {
                    $this->data['fields']['name'] = null;
                }
            }
        }

        return $this->data['fields']['name'];
    }

    /**
     * Set the "is_bundle" field.
     *
     * @param mixed $value The value.
     *
     * @return \Model\ResourceType The document (fluent interface).
     */
    public function setIs_bundle($value)
    {
        if (!isset($this->data['fields']['is_bundle'])) {
            if (!$this->isNew()) {
                $this->getIs_bundle();
                if ($this->isFieldEqualTo('is_bundle', $value)) {
                    return $this;
                }
            } else {
                if (null === $value) {
                    return $this;
                }
                $this->fieldsModified['is_bundle'] = null;
                $this->data['fields']['is_bundle'] = $value;
                return $this;
            }
        } elseif ($this->isFieldEqualTo('is_bundle', $value)) {
            return $this;
        }

        if (!isset($this->fieldsModified['is_bundle']) && !array_key_exists('is_bundle', $this->fieldsModified)) {
            $this->fieldsModified['is_bundle'] = $this->data['fields']['is_bundle'];
        } elseif ($this->isFieldModifiedEqualTo('is_bundle', $value)) {
            unset($this->fieldsModified['is_bundle']);
        }

        $this->data['fields']['is_bundle'] = $value;

        return $this;
    }

    /**
     * Returns the "is_bundle" field.
     *
     * @return mixed The $name field.
     */
    public function getIs_bundle()
    {
        if (!isset($this->data['fields']['is_bundle'])) {
            if ($this->isNew()) {
                $this->data['fields']['is_bundle'] = null;
            } elseif (!isset($this->data['fields']) || !array_key_exists('is_bundle', $this->data['fields'])) {
                $this->addFieldCache('is_bundle');
                $data = $this->getRepository()->getCollection()->findOne(array('_id' => $this->getId()), array('is_bundle' => 1));
                if (isset($data['is_bundle'])) {
                    $this->data['fields']['is_bundle'] = (bool) $data['is_bundle'];
                } else {
                    $this->data['fields']['is_bundle'] = null;
                }
            }
        }

        return $this->data['fields']['is_bundle'];
    }

    private function isFieldEqualTo($field, $otherValue)
    {
        $value = $this->data['fields'][$field];

        return $this->isFieldValueEqualTo($value, $otherValue);
    }

    private function isFieldModifiedEqualTo($field, $otherValue)
    {
        $value = $this->fieldsModified[$field];

        return $this->isFieldValueEqualTo($value, $otherValue);
    }

    protected function isFieldValueEqualTo($value, $otherValue)
    {
        if (is_object($value)) {
            return $value == $otherValue;
        }

        return $value === $otherValue;
    }

    /**
     * Process onDelete.
     */
    public function processOnDelete()
    {
    }

    private function processOnDeleteCascade($class, array $criteria)
    {
        $repository = $this->getMandango()->getRepository($class);
        $documents = $repository->createQuery($criteria)->all();
        if (count($documents)) {
            $repository->delete($documents);
        }
    }

    private function processOnDeleteUnset($class, array $criteria, array $update)
    {
        $this->getMandango()->getRepository($class)->update($criteria, $update, array('multiple' => true));
    }

    /**
     * Returns the "attributes" embedded many.
     *
     * @return \Mandango\Group\EmbeddedGroup The "attributes" embedded many.
     */
    public function getAttributes()
    {
        if (!isset($this->data['embeddedsMany']['attributes'])) {
            $this->data['embeddedsMany']['attributes'] = $embedded = new \Mandango\Group\EmbeddedGroup('Model\AttributeType');
            $embedded->setRootAndPath($this, 'attributes');
        }

        return $this->data['embeddedsMany']['attributes'];
    }

    /**
     * Adds documents to the "attributes" embeddeds many.
     *
     * @param mixed $documents A document or an array or documents.
     *
     * @return \Model\ResourceType The document (fluent interface).
     */
    public function addAttributes($documents)
    {
        $this->getAttributes()->add($documents);

        return $this;
    }

    /**
     * Removes documents to the "attributes" embeddeds many.
     *
     * @param mixed $documents A document or an array or documents.
     *
     * @return \Model\ResourceType The document (fluent interface).
     */
    public function removeAttributes($documents)
    {
        $this->getAttributes()->remove($documents);

        return $this;
    }

    /**
     * Resets the groups of the document.
     */
    public function resetGroups()
    {
        if (isset($this->data['embeddedsMany']['attributes'])) {
            $this->data['embeddedsMany']['attributes']->reset();
        }
    }

    /**
     * Set a document data value by data name as string.
     *
     * @param string $name  The data name.
     * @param mixed  $value The value.
     *
     * @return mixed the data name setter return value.
     *
     * @throws \InvalidArgumentException If the data name is not valid.
     */
    public function set($name, $value)
    {
        if ('name' == $name) {
            return $this->setName($value);
        }
        if ('is_bundle' == $name) {
            return $this->setIs_bundle($value);
        }

        throw new \InvalidArgumentException(sprintf('The document data "%s" is not valid.', $name));
    }

    /**
     * Returns a document data by data name as string.
     *
     * @param string $name The data name.
     *
     * @return mixed The data name getter return value.
     *
     * @throws \InvalidArgumentException If the data name is not valid.
     */
    public function get($name)
    {
        if ('name' == $name) {
            return $this->getName();
        }
        if ('is_bundle' == $name) {
            return $this->getIs_bundle();
        }
        if ('attributes' == $name) {
            return $this->getAttributes();
        }

        throw new \InvalidArgumentException(sprintf('The document data "%s" is not valid.', $name));
    }

    /**
     * Imports data from an array.
     *
     * @param array $array An array.
     *
     * @return \Model\ResourceType The document (fluent interface).
     */
    public function fromArray(array $array)
    {
        if (isset($array['id'])) {
            $this->setId($array['id']);
        }
        if (isset($array['name'])) {
            $this->setName($array['name']);
        }
        if (isset($array['is_bundle'])) {
            $this->setIs_bundle($array['is_bundle']);
        }
        if (isset($array['attributes'])) {
            $embeddeds = array();
            foreach ($array['attributes'] as $documentData) {
                $embeddeds[] = $embedded = new \Model\AttributeType($this->getMandango());
                $embedded->setDocumentData($documentData);
            }
            $this->getAttributes()->replace($embeddeds);
        }

        return $this;
    }

    /**
     * Export the document data to an array.
     *
     * @param Boolean $withReferenceFields Whether include the fields of references or not (false by default).
     *
     * @return array An array with the document data.
     */
    public function toArray($withReferenceFields = false)
    {
        $array = array('id' => $this->getId());

        $array['name'] = $this->getName();
        $array['is_bundle'] = $this->getIs_bundle();

        return $array;
    }

    /**
     * Query for save.
     */
    public function queryForSave()
    {
        $isNew = $this->isNew();
        $query = array();
        $reset = false;

        if (isset($this->data['fields'])) {
            if ($isNew || $reset) {
                if (isset($this->data['fields']['name'])) {
                    $query['name'] = (string) $this->data['fields']['name'];
                }
                if (isset($this->data['fields']['is_bundle'])) {
                    $query['is_bundle'] = (bool) $this->data['fields']['is_bundle'];
                }
            } else {
                if (isset($this->data['fields']['name']) || array_key_exists('name', $this->data['fields'])) {
                    $value = $this->data['fields']['name'];
                    $originalValue = $this->getOriginalFieldValue('name');
                    if ($value !== $originalValue) {
                        if (null !== $value) {
                            $query['$set']['name'] = (string) $this->data['fields']['name'];
                        } else {
                            $query['$unset']['name'] = 1;
                        }
                    }
                }
                if (isset($this->data['fields']['is_bundle']) || array_key_exists('is_bundle', $this->data['fields'])) {
                    $value = $this->data['fields']['is_bundle'];
                    $originalValue = $this->getOriginalFieldValue('is_bundle');
                    if ($value !== $originalValue) {
                        if (null !== $value) {
                            $query['$set']['is_bundle'] = (bool) $this->data['fields']['is_bundle'];
                        } else {
                            $query['$unset']['is_bundle'] = 1;
                        }
                    }
                }
            }
        }
        if (true === $reset) {
            $reset = 'deep';
        }
        if (isset($this->data['embeddedsMany'])) {
            if ($isNew) {
                if (isset($this->data['embeddedsMany']['attributes'])) {
                    foreach ($this->data['embeddedsMany']['attributes']->getAdd() as $document) {
                        $query = $document->queryForSave($query, $isNew);
                    }
                }
            } else {
                if (isset($this->data['embeddedsMany']['attributes'])) {
                    $group = $this->data['embeddedsMany']['attributes'];
                    foreach ($group->getSaved() as $document) {
                        $query = $document->queryForSave($query, $isNew);
                    }
                    $groupRap = $group->getRootAndPath();
                    foreach ($group->getAdd() as $document) {
                        $q = $document->queryForSave(array(), true);
                        $rap = $document->getRootAndPath();
                        foreach (explode('.', $rap['path']) as $name) {
                            if (0 === strpos($name, '_add')) {
                                $name = substr($name, 4);
                            }
                            $q = $q[$name];
                        }
                        $query['$pushAll'][$groupRap['path']][] = $q;
                    }
                    foreach ($group->getRemove() as $document) {
                        $rap = $document->getRootAndPath();
                        $query['$unset'][$rap['path']] = 1;
                    }
                }
            }
        }

        return $query;
    }
}