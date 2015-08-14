<?php

namespace Model\Base;

/**
 * Base class of Model\Resource document.
 */
abstract class Resource extends \Mandango\Document\Document
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
     * @return \Model\Resource The document (fluent interface).
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
        if (isset($data['type'])) {
            $this->data['fields']['type_reference_field'] = $data['type'];
        } elseif (isset($data['_fields']['type'])) {
            $this->data['fields']['type_reference_field'] = null;
        }
        if (isset($data['resources'])) {
            $this->data['fields']['resources_reference_field'] = $data['resources'];
        } elseif (isset($data['_fields']['resources'])) {
            $this->data['fields']['resources_reference_field'] = null;
        }
        if (isset($data['attributes'])) {
            $embedded = new \Mandango\Group\EmbeddedGroup('Model\Attribute');
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
     * @return \Model\Resource The document (fluent interface).
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
     * Set the "type_reference_field" field.
     *
     * @param mixed $value The value.
     *
     * @return \Model\Resource The document (fluent interface).
     */
    public function setType_reference_field($value)
    {
        if (!isset($this->data['fields']['type_reference_field'])) {
            if (!$this->isNew()) {
                $this->getType_reference_field();
                if ($this->isFieldEqualTo('type_reference_field', $value)) {
                    return $this;
                }
            } else {
                if (null === $value) {
                    return $this;
                }
                $this->fieldsModified['type_reference_field'] = null;
                $this->data['fields']['type_reference_field'] = $value;
                return $this;
            }
        } elseif ($this->isFieldEqualTo('type_reference_field', $value)) {
            return $this;
        }

        if (!isset($this->fieldsModified['type_reference_field']) && !array_key_exists('type_reference_field', $this->fieldsModified)) {
            $this->fieldsModified['type_reference_field'] = $this->data['fields']['type_reference_field'];
        } elseif ($this->isFieldModifiedEqualTo('type_reference_field', $value)) {
            unset($this->fieldsModified['type_reference_field']);
        }

        $this->data['fields']['type_reference_field'] = $value;

        return $this;
    }

    /**
     * Returns the "type_reference_field" field.
     *
     * @return mixed The $name field.
     */
    public function getType_reference_field()
    {
        if (!isset($this->data['fields']['type_reference_field'])) {
            if ($this->isNew()) {
                $this->data['fields']['type_reference_field'] = null;
            } elseif (!isset($this->data['fields']) || !array_key_exists('type_reference_field', $this->data['fields'])) {
                $this->addFieldCache('type');
                $data = $this->getRepository()->getCollection()->findOne(array('_id' => $this->getId()), array('type' => 1));
                if (isset($data['type'])) {
                    $this->data['fields']['type_reference_field'] = $data['type'];
                } else {
                    $this->data['fields']['type_reference_field'] = null;
                }
            }
        }

        return $this->data['fields']['type_reference_field'];
    }

    /**
     * Set the "resources_reference_field" field.
     *
     * @param mixed $value The value.
     *
     * @return \Model\Resource The document (fluent interface).
     */
    public function setResources_reference_field($value)
    {
        if (!isset($this->data['fields']['resources_reference_field'])) {
            if (!$this->isNew()) {
                $this->getResources_reference_field();
                if ($this->isFieldEqualTo('resources_reference_field', $value)) {
                    return $this;
                }
            } else {
                if (null === $value) {
                    return $this;
                }
                $this->fieldsModified['resources_reference_field'] = null;
                $this->data['fields']['resources_reference_field'] = $value;
                return $this;
            }
        } elseif ($this->isFieldEqualTo('resources_reference_field', $value)) {
            return $this;
        }

        if (!isset($this->fieldsModified['resources_reference_field']) && !array_key_exists('resources_reference_field', $this->fieldsModified)) {
            $this->fieldsModified['resources_reference_field'] = $this->data['fields']['resources_reference_field'];
        } elseif ($this->isFieldModifiedEqualTo('resources_reference_field', $value)) {
            unset($this->fieldsModified['resources_reference_field']);
        }

        $this->data['fields']['resources_reference_field'] = $value;

        return $this;
    }

    /**
     * Returns the "resources_reference_field" field.
     *
     * @return mixed The $name field.
     */
    public function getResources_reference_field()
    {
        if (!isset($this->data['fields']['resources_reference_field'])) {
            if ($this->isNew()) {
                $this->data['fields']['resources_reference_field'] = null;
            } elseif (!isset($this->data['fields']) || !array_key_exists('resources_reference_field', $this->data['fields'])) {
                $this->addFieldCache('resources');
                $data = $this->getRepository()->getCollection()->findOne(array('_id' => $this->getId()), array('resources' => 1));
                if (isset($data['resources'])) {
                    $this->data['fields']['resources_reference_field'] = $data['resources'];
                } else {
                    $this->data['fields']['resources_reference_field'] = null;
                }
            }
        }

        return $this->data['fields']['resources_reference_field'];
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
     * Set the "type" reference.
     *
     * @param \Model\ResourceType|null $value The reference, or null.
     *
     * @return \Model\Resource The document (fluent interface).
     *
     * @throws \InvalidArgumentException If the class is not an instance of Model\ResourceType.
     */
    public function setType($value)
    {
        if (null !== $value && !$value instanceof \Model\ResourceType) {
            throw new \InvalidArgumentException('The "type" reference is not an instance of Model\ResourceType.');
        }

        $this->setType_reference_field((null === $value || $value->isNew()) ? null : $value->getId());

        $this->data['referencesOne']['type'] = $value;

        return $this;
    }

    /**
     * Returns the "type" reference.
     *
     * @return \Model\ResourceType|null The reference or null if it does not exist.
     */
    public function getType()
    {
        if (!isset($this->data['referencesOne']['type'])) {
            if (!$this->isNew()) {
                $this->addReferenceCache('type');
            }
            if (!$id = $this->getType_reference_field()) {
                return null;
            }
            if (!$document = $this->getMandango()->getRepository('Model\ResourceType')->findOneById($id)) {
                throw new \RuntimeException('The reference "type" does not exist.');
            }
            $this->data['referencesOne']['type'] = $document;
        }

        return $this->data['referencesOne']['type'];
    }

    /**
     * Returns the "resources" reference.
     *
     * @return \Mandango\Group\ReferenceGroup The reference.
     */
    public function getResources()
    {
        if (!isset($this->data['referencesMany']['resources'])) {
            if (!$this->isNew()) {
                $this->addReferenceCache('resources');
            }
            $this->data['referencesMany']['resources'] = new \Mandango\Group\ReferenceGroup('Model\Resource', $this, 'resources_reference_field');
        }

        return $this->data['referencesMany']['resources'];
    }

    /**
     * Adds documents to the "resources" reference many.
     *
     * @param mixed $documents A document or an array or documents.
     *
     * @return \Model\Resource The document (fluent interface).
     */
    public function addResources($documents)
    {
        $this->getResources()->add($documents);

        return $this;
    }

    /**
     * Removes documents to the "resources" reference many.
     *
     * @param mixed $documents A document or an array or documents.
     *
     * @return \Model\Resource The document (fluent interface).
     */
    public function removeResources($documents)
    {
        $this->getResources()->remove($documents);

        return $this;
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
     * Update the value of the reference fields.
     */
    public function updateReferenceFields()
    {
        if (isset($this->data['referencesOne']['type']) && !isset($this->data['fields']['type_reference_field'])) {
            $this->setType_reference_field($this->data['referencesOne']['type']->getId());
        }
        if (isset($this->data['referencesMany']['resources'])) {
            $group = $this->data['referencesMany']['resources'];
            $add = $group->getAdd();
            $remove = $group->getRemove();
            if ($add || $remove) {
                $ids = $this->getResources_reference_field();
                foreach ($add as $document) {
                    $ids[] = $document->getId();
                }
                foreach ($remove as $document) {
                    if (false !== $key = array_search($document->getId(), $ids)) {
                        unset($ids[$key]);
                    }
                }
                $this->setResources_reference_field($ids ? array_values($ids) : null);
            }
        }
    }

    /**
     * Save the references.
     */
    public function saveReferences()
    {
        if (isset($this->data['referencesOne']['type'])) {
            $this->data['referencesOne']['type']->save();
        }
        if (isset($this->data['referencesMany']['resources'])) {
            $group = $this->data['referencesMany']['resources'];
            $documents = array();
            foreach ($group->getAdd() as $document) {
                $documents[] = $document;
            }
            if ($group->isSavedInitialized()) {
                foreach ($group->getSaved() as $document) {
                    $documents[] = $document;
                }
            }
            if ($documents) {
                $this->getMandango()->getRepository('Model\Resource')->save($documents);
            }
        }
    }

    /**
     * Returns the "attributes" embedded many.
     *
     * @return \Mandango\Group\EmbeddedGroup The "attributes" embedded many.
     */
    public function getAttributes()
    {
        if (!isset($this->data['embeddedsMany']['attributes'])) {
            $this->data['embeddedsMany']['attributes'] = $embedded = new \Mandango\Group\EmbeddedGroup('Model\Attribute');
            $embedded->setRootAndPath($this, 'attributes');
        }

        return $this->data['embeddedsMany']['attributes'];
    }

    /**
     * Adds documents to the "attributes" embeddeds many.
     *
     * @param mixed $documents A document or an array or documents.
     *
     * @return \Model\Resource The document (fluent interface).
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
     * @return \Model\Resource The document (fluent interface).
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
        if (isset($this->data['referencesMany']['resources'])) {
            $this->data['referencesMany']['resources']->reset();
        }
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
        if ('type_reference_field' == $name) {
            return $this->setType_reference_field($value);
        }
        if ('resources_reference_field' == $name) {
            return $this->setResources_reference_field($value);
        }
        if ('type' == $name) {
            return $this->setType($value);
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
        if ('type_reference_field' == $name) {
            return $this->getType_reference_field();
        }
        if ('resources_reference_field' == $name) {
            return $this->getResources_reference_field();
        }
        if ('type' == $name) {
            return $this->getType();
        }
        if ('resources' == $name) {
            return $this->getResources();
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
     * @return \Model\Resource The document (fluent interface).
     */
    public function fromArray(array $array)
    {
        if (isset($array['id'])) {
            $this->setId($array['id']);
        }
        if (isset($array['name'])) {
            $this->setName($array['name']);
        }
        if (isset($array['type_reference_field'])) {
            $this->setType_reference_field($array['type_reference_field']);
        }
        if (isset($array['resources_reference_field'])) {
            $this->setResources_reference_field($array['resources_reference_field']);
        }
        if (isset($array['type'])) {
            $this->setType($array['type']);
        }
        if (isset($array['resources'])) {
            $this->removeResources($this->getResources()->all());
            $this->addResources($array['resources']);
        }
        if (isset($array['attributes'])) {
            $embeddeds = array();
            foreach ($array['attributes'] as $documentData) {
                $embeddeds[] = $embedded = new \Model\Attribute($this->getMandango());
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
        if ($withReferenceFields) {
            $array['type_reference_field'] = $this->getType_reference_field();
        }
        if ($withReferenceFields) {
            $array['resources_reference_field'] = $this->getResources_reference_field();
        }

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
                if (isset($this->data['fields']['type_reference_field'])) {
                    $query['type'] = $this->data['fields']['type_reference_field'];
                }
                if (isset($this->data['fields']['resources_reference_field'])) {
                    $query['resources'] = $this->data['fields']['resources_reference_field'];
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
                if (isset($this->data['fields']['type_reference_field']) || array_key_exists('type_reference_field', $this->data['fields'])) {
                    $value = $this->data['fields']['type_reference_field'];
                    $originalValue = $this->getOriginalFieldValue('type_reference_field');
                    if ($value !== $originalValue) {
                        if (null !== $value) {
                            $query['$set']['type'] = $this->data['fields']['type_reference_field'];
                        } else {
                            $query['$unset']['type'] = 1;
                        }
                    }
                }
                if (isset($this->data['fields']['resources_reference_field']) || array_key_exists('resources_reference_field', $this->data['fields'])) {
                    $value = $this->data['fields']['resources_reference_field'];
                    $originalValue = $this->getOriginalFieldValue('resources_reference_field');
                    if ($value !== $originalValue) {
                        if (null !== $value) {
                            $query['$set']['resources'] = $this->data['fields']['resources_reference_field'];
                        } else {
                            $query['$unset']['resources'] = 1;
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