var app = angular.module('demo', ['ngFormBuilder']);

app.controller('MainCtrl', ['$scope', 'FormBuilderService', 'FBValidators',
    function($scope, fb, Validators) {
        'use strict';

        $scope.formGroup = fb.group({
          title: [''],
          description: [''],
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
              name: ['', ],
              quantity: ['']
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
