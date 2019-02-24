var app = angular.module('demo', ['ngFormBuilder']);

app.controller('MainCtrl', ['$scope', 'FormBuilderService', 'FBValidators',
    function($scope, fb, Validators) {
        'use strict';

        $scope.formGroup = fb.group({
            recipeImage: [],
            title: ['', [Validators.required, Validators.minLength(2)]],
            description: ['', [Validators.required, Validators.minLength(2)]],
            category: ['1'],
            ingredients: fb.array([]),
            difficulty: [],
            gluten_free: []
        });

        $scope.add = function () {
          $scope.formGroup.controls.ingredients.controls.push(fb.group({
              name: ['', [Validators.required, Validators.minLength(2)]],
              quantity: [0, [Validators.required, Validators.min(1)]]
          }));
        };

        // Add first ingredient on Init
        $scope.add();

        $scope.remove = function (index) {
            $scope.formGroup.controls.ingredients.removeAt(index);
        };

        $scope.submitForm = function () {
          console.log($scope.formGroup);
        };
    }
]);
