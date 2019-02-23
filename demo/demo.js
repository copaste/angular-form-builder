var app = angular.module('demo', ['ngFormBuilder']);

app.controller('MainCtrl', ['$scope', 'FormBuilderService',
    function($scope, fb) {
        'use strict';

        $scope.formGroup = fb.group({
          status: ['Free'],
          role:[['1','2']],
          list: fb.array([
            fb.group({
              ingr: [''],
              quantity: ['']
            })
          ])
        });

        $scope.add = function () {
          $scope.formGroup.controls.list.controls.push(fb.group({
              unit: [''],
              title: ['']
          }));
        };

        $scope.submitForm = function () {
          console.log($scope.formGroup);
        };
    }
]);
