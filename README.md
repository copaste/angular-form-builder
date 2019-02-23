ngFormBuilder - AngularJS
====================

Build more powerful Model Driven Forms.

# Basic Usage

## In Controller
```javascript
app.controller('MainCtrl', ['$scope', 'FormBuilderService',
    function($scope, fb) {

        $scope.formGroup = fb.group({
          title: ['']
        });

        $scope.submitForm = function () {
            console.log($scope.formGroup);
        }
    }
])
```

## In Template
```html
<form form-group="formGroup" class="card-body" ng-submit="submitForm($event)">
    <div class="form-group">
        <input type="text" class="form-control" form-control-name="name"/>
    </div>
</form>
```

