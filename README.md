ngFormBuilder - AngularJS
====================

Build more powerful Model Driven Forms.

## Basic Usage

**In Controller**
```javascript
app.controller('MainCtrl', ['$scope', 'ngFormBuilderService',
    function($scope, fb) {

        $scope.formGroup = fb.group({
          name: ['']
        });

        $scope.submitForm = function () {
            console.log($scope.formGroup);
        }
    }
])
```

**In Template**
```html
<form form-group="formGroup" class="card-body" ng-submit="submitForm($event)">
    <div class="form-group">
        <input type="text" class="form-control" form-control-name="name"/>
    </div>
</form>
```

## FormArray
**In Controller**
```javascript
app.controller('MainCtrl', ['$scope', 'ngFormBuilderService',
    function($scope, fb) {

        $scope.formGroup = fb.group({
          ingredients: fb.array([]),
        });

        $scope.add = function () {
          $scope.formGroup.controls.ingredients.controls.push(fb.group({
              name: [''],
              quantity: [0]
          }));
        };

        // Add first ingredient on Init
        $scope.add();

        $scope.remove = function (index) {
            $scope.formGroup.controls.ingredients.removeAt(index);
        };

        $scope.submitForm = function () {
            console.log($scope.formGroup);
        }
    }
])
```

**In Template**
```html
<form form-group="formGroup" class="card-body" ng-submit="submitForm($event)">
    <ul class="list-unstyled">
        <li form-array-name="ingredients" ng-repeat="item in formGroup.controls.ingredients.controls">
            <div form-group-name="{{$index}}" class="row mb-3">
                <div class="col">
                    <input class="form-control" placeholder="Ingredient" form-control-name="name">
                </div>
                <div class="col">
                    <input class="form-control" placeholder="Quatitty" form-control-name="quantity">
                </div>
                <div class="col">
                    <button type="button" class="btn btn-secondary" ng-click="remove($index)">Remove</button>
                </div>
            </div>
        </li>
    </ul>
    <button type="button" class="btn btn-primary" ng-click="add()">Add</button>
</form>
```

## Validators
**In Controller**
```javascript
app.controller('MainCtrl', ['$scope', 'ngFormBuilderService', 'ngFormBuilderValidators',
    function($scope, fb, Validators) {

        $scope.formGroup = fb.group({
          name: ['', [Validators.required, Validators.minLength(3)]]
        });

        $scope.submitForm = function () {
            console.log($scope.formGroup);
        }
    }
])
```

**In Template**
```html
<form form-group="formGroup" class="card-body" ng-submit="submitForm($event)">
    <div class="form-group">
        <input type="text" class="form-control" form-control-name="name"/>
    </div>
</form>
```

### Build in Validators

- .required
- .minLength(number)
- .maxLength(number)
- .min(number)
- .max(number)
- .pattern(RegExp)
- .email(string)

## Async Validators (Custom)

**In Controller**
```javascript
app.controller('MainCtrl', ['$scope', 'ngFormBuilderService', 'ngFormBuilderValidators', 'UserService',
    function($scope, fb, Validators, User) {

        $scope.isUniqueUsername = function (control) {
            return User.checkUsername(control.value).then(function (response) {
                return response.isUnique ? null : { isUniqueUsername: true };
            });
        }

        $scope.formGroup = fb.group({
          username: ['', null, $scope.isUniqueUsername]
        });

        $scope.submitForm = function () {
            console.log($scope.formGroup);
        }
    }
])
```