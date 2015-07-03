/*global define */
define(['jquery', 'underscore', 'easel', 'model/obstacle'], function ($, _, createjs, ObstacleModel) {
    'use strict';
    var ObstacleGenerator,
        instance,
        Obstacles;

    Obstacles = [
        {
            name: 'brick',
            generate: function () {
                var spriteSheet = new createjs.SpriteSheet({
                    images: [
                        'build/images/obstacles/aster/03_Aster.png',
                        'build/images/obstacles/aster/04_Aster.png',
                        'build/images/obstacles/aster/05_Aster.png'
                    ],
                    frames: {
                        width: 80,
                        height: 40
                    },
                    animations: {
                        pulse: [0, 2, 'pulse', 0.089]
                    }
                });
                return new createjs.Sprite(spriteSheet, 'pulse');
            },
            velocity: 5,
            width: 80,
            chance: 0.2
        },
        {
            name: 'brick',
            generate: function () {
                var spriteSheet = new createjs.SpriteSheet({
                    images: [
                        'build/images/obstacles/bullet/01_Bullet.png',
                        'build/images/obstacles/bullet/02_Bullet.png'
                    ],
                    frames: {
                        width: 112,
                        height: 32
                    },
                    animations: {
                        pulse: [0, 1, 'pulse', 0.089]
                    }
                });
                return new createjs.Sprite(spriteSheet, 'pulse');
            },
            velocity: 7,
            width: 112,
            chance: 0.8
        },
        {
            name: 'brick',
            generate: function () {
                var spriteSheet = new createjs.SpriteSheet({
                    images: [
                        'build/images/obstacles/ground/01_Lava.png',
                        'build/images/obstacles/ground/02_Lava.png'
                    ],
                    frames: {
                        width: 104,
                        height: 96
                    },
                    animations: {
                        pulse: [0, 1, 'pulse', 0.089]
                    }
                });
                return new createjs.Sprite(spriteSheet, 'pulse');
            },
            velocity: 3,
            ground: true,
            width: 104,
            chance: 0.2
        },
        {
            name: 'brick',
            generate: function () {
                var spriteSheet = new createjs.SpriteSheet({
                    images: [
                        'build/images/obstacles/ground/03_Lava_S.png',
                        'build/images/obstacles/ground/04_Lava_S.png'
                    ],
                    frames: {
                        width: 72,
                        height: 40
                    },
                    animations: {
                        pulse: [0, 1, 'pulse', 0.089]
                    }
                });
                return new createjs.Sprite(spriteSheet, 'pulse');
            },
            velocity: 3,
            width: 72,
            ground: true,
            chance: 0.2
        }
    ];

    ObstacleGenerator = function (data) {
        var that = this;

        this.threshhold = 0;
        this.state = data.state;
        this.weights = [];
        this.startTime = new Date();
        this.objects = [];
        this.render = data.render;

        _.each(Obstacles, function (v) {
            that.weights.push(v.chance);
        });

        createjs.Ticker.addEventListener('tick', this.tick);
    };

    ObstacleGenerator.prototype.removeObject = function (object) {
        var index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    };

    ObstacleGenerator.prototype.clear = function () {
        createjs.Ticker.removeEventListener('tick', this.tick);
    };

    ObstacleGenerator.prototype.rand = function (min, max) {
        return Math.random() * (max - min) + min;
    };

    ObstacleGenerator.prototype.getRandomItem = function (list, weight) {
        var total_weight = weight.reduce(function (prev, cur) {
                return prev + cur;
            }), random_num = this.rand(0, total_weight),
            weight_sum = 0,
            i;

        for (i = 0; i < list.length; i++) {
            weight_sum += weight[i];
            weight_sum = +weight_sum.toFixed(2);

            if (random_num <= weight_sum) {
                return list[i];
            }
        }

        return list[0];
    };

    ObstacleGenerator.prototype.tick = function (e) {
        var item,
            thing,
            elapsed = 0, data;

        instance.threshhold -= e.delta / 5;

        if (instance.threshhold < 0) {
            instance.threshhold = Math.random() * 500;
            item = instance.getRandomItem(Obstacles, instance.weights);
            elapsed = Math.floor((new Date() - instance.startTime) / 1000 / 60 * 7);
            if (elapsed < 0.5) {
                elapsed = 1;
            } else if (elapsed > 2) {
                elapsed = 2;
            }

            thing = item.generate();
            data = {
                object: thing,
                velocity: item.velocity * instance.rand(80, 100) / 100 * elapsed,
                states: instance.state,
                type: item.name
            };
            if (item.ground) {
                data['y'] = instance.render.height - 200;
                data['velocity'] = item.velocity;
            }
            var m = new ObstacleModel(data);
            instance.state.addChild(thing);
            instance.objects.push(m);
        }
    };


    return function (data) {
        return (function () {
            instance = new ObstacleGenerator(data);
            return instance;
        }());
    };
});