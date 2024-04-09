<?php

namespace MiniShop3\Controllers\Storage\DB;

use MiniShop3\MiniShop3;
use MiniShop3\Model\msDelivery;
use MiniShop3\Model\msOrder;
use MiniShop3\Model\msOrderAddress;
use MiniShop3\Model\msPayment;
use MODX\Revolution\modX;
use MiniShop3\Controllers\Order\OrderInterface;
use Rakit\Validation\Validator;

class DBOrder extends DBStorage implements OrderInterface
{
    private $config;
    private $order;

    protected $validationRules = [];
    protected $validationMessages = [];
    protected $deliverValidationRules;

    /**
     * @param string $token
     * @param $config
     * @return bool
     */
    public function initialize(string $token = '', $config = []): bool
    {
        if (empty($token)) {
            return false;
        }
        $this->token = $token;
        $this->config = $config;
        if (!empty($_SESSION['ms3']['validation']['rules'])) {
            $this->validationRules = $_SESSION['ms3']['validation']['rules'];
        }
        if (!empty($_SESSION['ms3']['validation']['messages'])) {
            $this->validationMessages = $_SESSION['ms3']['validation']['messages'];
        }
        return true;
    }

    public function get(): array
    {
        if (empty($this->token)) {
            return $this->error('ms3_err_token');
        }
        $this->initDraft();

        //TODO Добавить событие?
//        $response = $this->invokeEvent('msOnBeforeGetOrder', [
//            'draft' => $this->draft,
//            'cart' => $this,
//        ]);
//        if (!($response['success'])) {
//            return $this->error($response['message']);
//        }
        $this->order = $this->getOrder();

        //TODO Добавить событие?
//        $response = $this->invokeEvent('msOnGetOrder, [
//            'draft' => $this->draft,
//            'data' => $this->order,
//            'cart' => $this
//        ]);
//
//        if (!$response['success']) {
//            return $this->error($response['message']);
//        }
//
//        $this->cart = $response['data']['data'];

        $data = [];

        $data['order'] = $this->order;
        return $this->success(
            'ms3_order_get_success',
            $data
        );
    }

    public function getCost($with_cart = true, $only_cost = false): array
    {
        $response = $this->ms3->utils->invokeEvent('msOnBeforeGetOrderCost', [
            'controller' => $this,
            'cart' => $this->ms3->cart,
            'with_cart' => $with_cart,
            'only_cost' => $only_cost,
        ]);
        if (!$response['success']) {
            return $this->error($response['message']);
        }

        $cost = 0;
        $cart = [];
        $this->ms3->cart->initialize($this->ms3->config['ctx'], $this->token);
        $response = $this->ms3->cart->status();
        if ($response['success']) {
            $cart = $response['data'];
            $cost = $with_cart
                ? $cart['total_cost']
                : 0;
        }

        $delivery_cost = 0;
        if (!empty($this->order['delivery_id'])) {
            /** @var msDelivery $msDelivery */
            $msDelivery = $this->modx->getObject(
                msDelivery::class,
                ['id' => $this->order['delivery_id']]
            );
            if ($msDelivery) {
                $cost = $msDelivery->getCost($this, $cost);
                $delivery_cost = $cost - $cart['total_cost'];
                $this->setDeliveryCost($delivery_cost);
            }
        }

        if (!empty($this->order['payment_id'])) {
            /** @var msPayment $msPayment */
            $msPayment = $this->modx->getObject(
                msPayment::class,
                ['id' => $this->order['payment_id']]
            );
            if ($msPayment) {
                $cost = $msPayment->getCost($this, $cost);
            }
        }

        $response = $this->ms3->utils->invokeEvent('msOnGetOrderCost', [
            'controller' => $this,
            'cart' => $this->ms3->cart,
            'with_cart' => $with_cart,
            'only_cost' => $only_cost,
            'cost' => $cost,
            'delivery_cost' => $delivery_cost,
        ]);
        if (!$response['success']) {
            return $this->error($response['message']);
        }
        $cost = $response['data']['cost'];
        $delivery_cost = $response['data']['delivery_cost'];

        $data = $only_cost
            ? $cost
            : $this->success('', [
                'cost' => $cost,
                'cart_cost' => $cart['total_cost'],
                'discount_cost' => $cart['total_discount'],
                'delivery_cost' => $delivery_cost
            ]);

        return $this->success(
            'ms3_order_getcost_success',
            $data
        );
    }

    public function add(string $key, mixed $value = null): array
    {
        if (empty($this->order)) {
            $response = $this->get();
            if ($response['success']) {
                $this->order = $response['data']['order'];
            }
        }
        $response = $this->ms3->utils->invokeEvent('msOnBeforeAddToOrder', [
            'key' => $key,
            'value' => $value,
            'controller' => $this,
        ]);
        if (!$response['success']) {
            return $this->error($response['message']);
        }
        $value = $response['data']['value'];

        if (empty($value)) {
            $this->remove($key);
            return $this->success('', [$key => null]);
        }
        $validateResponse = $this->validate($key, $value);
        if ($validateResponse['success']) {
            $validated = $validateResponse['data']['value'];
            $response = $this->ms3->utils->invokeEvent('msOnAddToOrder', [
                'key' => $key,
                'value' => $validated,
                'controller' => $this,
            ]);
            if (!$response['success']) {
                return $this->error($response['message']);
            }
            $validated = $response['data']['value'];
            $this->updateDraft($key, $validated);

            return $this->success('', [$key => $validated]);
        }
        $this->updateDraft($key);
        return $this->error($validateResponse['data']['error'][$key], [$key => null]);
    }

    public function validate(string $key, mixed $value): mixed
    {
        if (empty($this->order)) {
            $response = $this->get();
            if ($response['success']) {
                $this->order = $response['data']['order'];
            }
        }
        //TODO реализовать use custom validation rule для проверки существования payment, delivery,
        // для показа уникального message
        $this->validationRules = [
            'delivery_id' => 'required|numeric',
            'payment_id' => 'required|numeric',
        ];

        $this->validationMessages = [
            'required' => 'Обязательно для заполнения',
            'numeric' => 'Требуется число',
            'min' => 'Минимум :min символов',
            'email' => 'Email заполнен некорректно'
        ];

        if (!empty($this->order['delivery_id']) && empty($this->deliverValidationRules)) {
            $response = $this->getDeliverValidationRules($this->order['delivery_id']);
            if (!empty($response)) {
                $this->deliverValidationRules = $response;
                $this->validationRules = array_merge($this->validationRules, $this->deliverValidationRules);
            }
        }

        $eventParams = [
            'key' => $key,
            'value' => $value,
            'controller' => $this,
        ];
        $response = $this->invokeEvent('msOnBeforeValidateOrderValue', $eventParams);
        $value = $response['data']['value'];

        if (!isset($this->validationRules[$key])) {
            return $this->success('', [
                'value' => $response['data']['value']
            ]);
        }

        $validator = new Validator();

        $validation = $validator->validate(
            [$key => $value],
            [$key => $this->validationRules[$key]],
            $this->validationMessages
        );

        $validation->validate();

        if ($validation->fails()) {
            $errors = $validation->errors();
            $eventParams = [
                'key' => $key,
                'value' => $value,
                'error' => $errors->firstOfAll(),
                'controller' => $this,
            ];
            $response = $this->invokeEvent('msOnErrorValidateOrderValue', $eventParams);
            if (!empty($response['data']['error'])) {
                return $this->error('', [
                    'error' => $response['data']['error']
                ]);
            }
        } else {
            $eventParams = [
                'key' => $key,
                'value' => $value,
                'controller' => $this,
            ];
            $response = $this->invokeEvent('msOnValidateOrderValue', $eventParams);
        }
        return $this->success('', [
            'value' => $response['data']['value']
        ]);
    }

    public function remove($key): bool
    {
        if (empty($this->order)) {
            $response = $this->get();
            if ($response['success']) {
                $this->order = $response['data']['order'];
            }
        }
        if ($exists = array_key_exists($key, $this->order)) {
            $response = $this->ms3->utils->invokeEvent('msOnBeforeRemoveFromOrder', [
                'key' => $key,
                'controller' => $this,
            ]);
            if (!$response['success']) {
                return $this->error($response['message']);
            }

            //TODO тут не должно быть рекурсии. Очистить поле в базе и памяти
            $this->order = $this->remove($key);
            $response = $this->ms3->utils->invokeEvent('msOnRemoveFromOrder', [
                'key' => $key,
                'controller' => $this,
            ]);
            if (!$response['success']) {
                return $this->error($response['message']);
            }
        }

        return $exists;
    }

    public function set(array $order): array
    {
        if (empty($this->order)) {
            $response = $this->get();
            if ($response['success']) {
                $this->order = $response['data']['order'];
            }
        }
        //TODO учесть поля Customer
        foreach ($order as $key => $value) {
            $this->add($key, $value);
        }

        return $this->get();
    }

    public function submit(): array
    {
        if (empty($this->order)) {
            $response = $this->get();
            if ($response['success']) {
                $this->order = $response['data']['order'];
            }
        }
        return [];
    }

    public function clean(): bool
    {
        if (empty($this->order)) {
            $response = $this->get();
            if ($response['success']) {
                $this->order = $response['data']['order'];
            }
        }
        return true;
    }

    protected function getOrder()
    {
        $Address = $this->draft->getOne('Address');
        $output = $this->draft->toArray();
        if (!empty($Address)) {
            $addressFields = [];
            foreach ($Address->toArray() as $key => $value) {
                $addressFields['address_' . $key] = $value;
            }
            $output = array_merge($output, $addressFields);
        }
        return $output;
    }

    protected function setDeliveryCost($delivery_cost)
    {
        $cart_cost = $this->draft->get('cart_cost');
        $cost = $cart_cost + $delivery_cost;

        $this->draft->set('delivery_cost', $delivery_cost);
        $this->draft->set('cost', $cost);
        $this->draft->save();
    }

    protected function getDeliverValidationRules($delivery_id)
    {
        $q = $this->modx->newQuery(msDelivery::class);
        $q->where([
            'id' => $delivery_id,
            'active' => 1
        ]);
        $q->select('validation_rules');
        $q->prepare();
        $q->stmt->execute();
        $rules = $q->stmt->fetch(\PDO::FETCH_COLUMN);
        if (empty($rules)) {
            return [];
        }
        $rules = json_decode($rules, true);
        if (!is_array($rules)) {
            return [];
        }
        return $rules;
    }

    protected function updateDraft(string $key, mixed $value = null): bool
    {
        if (in_array($key, array_keys($this->draft->_fields))) {
            $this->draft->set($key, $value);
            $this->draft->set('updatedon', time());
            $this->draft->save();
            return true;
        }
        if (in_array($key, array_keys($this->draft->Address->_fields))) {
            $this->draft->Address->set($key, $value);
            $this->draft->Address->save();
            $this->draft->set('updatedon', time());
            $this->draft->save();
            return true;
        }
        // check msCustomer
        return false;
    }
}
