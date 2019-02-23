var app = angular.module('demo', ['ngFormBuilder']);

app.controller('MainCtrl', ['$scope', 'FormBuilderService', 'FBValidators',
    function($scope, fb, Validators) {
        'use strict';

        $scope.formGroup = fb.group({
          title: ['', [Validators.required, Validators.minLength(2)]],
          description: ['', [Validators.required, Validators.minLength(2)]],
          category: ['1'],
          ingradients: fb.array([
            fb.group({
              name: [''],
              quantity: ['']
            })
          ])
        });

        $scope.add = function () {
          $scope.formGroup.controls.ingradients.controls.push(fb.group({
              name: ['', [Validators.required, Validators.minLength(2)]],
              quantity: [0, [Validators.required, Validators.min(1)]]
          }));
        };

        $scope.remove = function (index) {
            $scope.formGroup.controls.ingradients.removeAt(index);
        };

        $scope.submitForm = function () {
          console.log($scope.formGroup);
        };
    }
]);
