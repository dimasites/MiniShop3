<?php

namespace MiniShop3\Controllers\Order;

use MiniShop3\MiniShop3;
use MiniShop3\Model\msDelivery;
use MiniShop3\Model\msDeliveryMember;
use MiniShop3\Model\msOrder;
use MiniShop3\Model\msPayment;
use MODX\Revolution\modX;
use MiniShop3\Controllers\Storage\DB\DBOrder;

class Order implements OrderInterface
{
    /** @var modX $modx */
    public $modx;
    /** @var MiniShop3 $ms3 */
    public $ms3;
    /** @var array $config */
    public $config = [];
    protected $storage;

    /**
     * Order constructor.
     *
     * @param MiniShop3 $ms3
     * @param array $config
     */
    public function __construct(MiniShop3 $ms3, array $config = [])
    {
        $this->ms3 = $ms3;
        $this->modx = $ms3->modx;

        $this->config = array_merge([], $config);

        $this->modx->lexicon->load('minishop3:cart');

        $this->storage = new DBOrder($this->modx, $this->ms3);
    }

    public function initialize(string $token = '', array $config = []): bool
    {
        return $this->storage->initialize($token, $this->config);
    }

    public function get(): array
    {
        return $this->storage->get();
    }

    /**
     * @param bool $with_cart
     * @param bool $only_cost
     *
     * @return array
     */
    public function getCost(bool $with_cart = true, bool $only_cost = false): array
    {
        return $this->storage->getCost($with_cart, $only_cost);
    }

    /**
     * @param string $key
     * @param string $value
     *
     * @return array
     */
    public function add(string $key, mixed $value = null): array
    {
        return $this->storage->add($key, $value);
    }

    /**
     * @param string $key
     * @param string $value
     *
     * @return bool|mixed|string
     */
    public function validate($key, $value): mixed
    {
        return $this->storage->validate($key, $value);
    }

    /**
     * @param string $key
     *
     * @return array|bool|string
     */
    public function remove($key): bool
    {
        return $this->storage->remove($key);
    }

    /**
     * @param array $order
     *
     * @return array
     */
    public function set(array $order): array
    {
        return $this->storage->set($order);
    }

    /**
     * Checks accordance of payment and delivery
     *
     * @param $delivery
     * @param $payment
     *
     * @return bool
     */
    public function hasPayment($delivery, $payment)
    {
        $q = $this->modx->newQuery(msPayment::class, ['id' => $payment, 'active' => 1]);
        $q->innerJoin(
            msDeliveryMember::class,
            'Member',
            'Member.payment_id = msPayment.id AND Member.delivery_id = ' . $delivery
        );

        return (bool)$this->modx->getCount(msPayment::class, $q);
    }

    /**
     * Returns required fields for delivery
     *
     * @param $id
     *
     * @return array|string
     */
    public function getDeliveryRequiresFields($deliveryId = 0)
    {
        /** @var array $validationRules */
        $validationRules = $this->getDeliveryValidationRules($deliveryId);
        if (!$validationRules['success']) {
            return $this->error('ms3_order_err_delivery', ['delivery']);
        }

        $requires = array_filter($validationRules['validation_rules'], function ($rules) {
            return in_array('required', array_map('trim', explode("|", $rules)));
        }, ARRAY_FILTER_USE_BOTH);

        return $this->success('', ['requires' => $requires]);
    }

    /**
     * Returns the validation rules for delivery
     *
     * @param integer $deliveryId
     * @return void
     */
    public function getDeliveryValidationRules($deliveryId = 0)
    {
        if (empty($deliveryId)) {
            // TODO: ждем реализации, чтобы корректно получать order
            $deliveryId = $this->order['delivery_id'];
        }
        /** @var msDelivery $delivery */
        $delivery = $this->modx->getObject(msDelivery::class, ['id' => $deliveryId, 'active' => 1]);
        if (!$delivery) {
            return $this->error('ms3_order_err_delivery', ['delivery']);
        }

        $rules = $delivery->get('validation_rules');
        $rules = empty($rules)
            ? []
            : $this->modx->fromJSON($rules, true);

        return $this->success('', ['validation_rules' => $rules]);
    }

    public function submit(): array
    {
        return [];
    }

    public function clean(): bool
    {
        return true;
    }

    /**
     * Return current number of order
     *
     * @return string
     */
    protected function getNum()
    {
        $format = htmlspecialchars($this->modx->getOption('ms3_order_format_num', null, 'ym'));
        $separator = trim(
            preg_replace(
                "/[^,\/\-]/",
                '',
                $this->modx->getOption('ms3_order_format_num_separator', null, '/')
            )
        );
        $separator = $separator ?: '/';

        $cur = $format ? date($format) : date('ym');

        $count = $num = 0;

        $c = $this->modx->newQuery(msOrder::class);
        $c->where(['num:LIKE' => "{$cur}%"]);
        $c->select('num');
        $c->sortby('id', 'DESC');
        $c->limit(1);
        if ($c->prepare() && $c->stmt->execute()) {
            $num = $c->stmt->fetchColumn();
            [, $count] = explode($separator, $num);
        }
        $count = intval($count) + 1;

        return sprintf('%s%s%d', $cur, $separator, $count);
    }

    /**
     * Shorthand for ms3 error method
     *
     * @param string $message
     * @param array $data
     * @param array $placeholders
     *
     * @return array|string
     */
    protected function error($message = '', $data = [], $placeholders = [])
    {
        return $this->ms3->utils->error($message, $data, $placeholders);
    }

    /**
     * Shorthand for ms3 success method
     *
     * @param string $message
     * @param array $data
     * @param array $placeholders
     *
     * @return array|string
     */
    protected function success($message = '', $data = [], $placeholders = [])
    {
        return $this->ms3->utils->success($message, $data, $placeholders);
    }

    /**
     * Shorthand for MS3 invokeEvent method
     *
     * @param string $eventName
     * @param array $params
     *
     * @return array|string
     */
    protected function invokeEvent(string $eventName, array $params = [])
    {
        return $this->ms3->utils->invokeEvent($eventName, $params);
    }
}
