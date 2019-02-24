/* global angular */
/*
    * @license
    * AngularJS Form Builder
    * Version: 1.0.0
    *
    * Copyright 2019-2019 Yordan Nikolov.
    * All Rights Reserved.
    * Use, reproduction, distribution, and modification of this code is subject to the terms and
    * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
    *
    * Authors: Yordan Nikolov
*/

(function(window, document) {
    'use strict';

    var FormErrorExamples = {
      formControlName: "\n    <div form-group=\"formGroup\">\n      <input form-control-name=\"firstName\">\n    </div>\n\n    In your controller or component:\n\n    $scope.formGroup = new FormGroup({\n       firstName: new FormControl()\n    });",
      formGroupName: "\n    <div form-group=\"formGroup\">\n       <div form-group-name=\"person\">\n          <input form-control-name=\"firstName\">\n       </div>\n    </div>\n\n    In your controller or component:\n\n    $scope.formGroup = new FormGroup({\n       person: new FormGroup({ firstName: new FormControl() })\n    });",
      formArrayName: "\n    <div form-group=\"formGroup\">\n      <div form-array-name=\"cities\">\n        <div ng-repeat=\"city in cityArray.controls\">\n          <input form-control-name=\"{{$index}}\">\n        </div>\n      </div>\n    </div>\n\n    In your controller or component:\n\n    $scope.cityArray = new FormArray([new FormControl('SF')]);\n    $scope.formGroup = new FormGroup({\n      cities: $scope.cityArray\n    });"
    };
    
    var ModelErrors = (function () {
        function ModelErrors() { }

        ModelErrors.controlParentException = function () {
            throw new Error("formControlName must be used with a parent formGroup directive.  You'll want to add a formGroup\n       directive and pass it an existing FormGroup instance (you can create one in your class).\n\n      Example:\n\n      " + FormErrorExamples.formControlName);
        };
        ModelErrors.missingFormException = function () {
            throw new Error("formGroup expects a FormGroup instance. Please pass one in.\n\n       Example:\n\n       " + FormErrorExamples.formControlName);
        };
        ModelErrors.groupParentException = function () {
            throw new Error("formGroupName must be used with a parent formGroup directive.  You'll want to add a formGroup\n      directive and pass it an existing FormGroup instance (you can create one in your class).\n\n      Example:\n\n      " + FormErrorExamples.formGroupName);
        };
        ModelErrors.arrayParentException = function () {
            throw new Error("formArrayName must be used with a parent formGroup directive.  You'll want to add a formGroup\n       directive and pass it an existing FormGroup instance (you can create one in your class).\n\n        Example:\n\n        " + FormErrorExamples.formArrayName);
        };
        ModelErrors.disabledAttrWarning = function () {
            console.warn("\n      It looks like you're using the disabled attribute with a reactive form directive. If you set disabled to true\n      when you set up this control in your component class, the disabled attribute will actually be set in the DOM for\n      you. We recommend using this approach to avoid 'changed after checked' errors.\n       \n      Example: \n      form = new FormGroup({\n        first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),\n        last: new FormControl('Drew', Validators.required)\n      });\n    ");
        };

        return ModelErrors;
    }());

    angular.module('ngFormBuilder', [])
    .directive(
        'formGroup', [

            function () {
                return {
                    scope: {
                        formGroup: '<',
                    },
                    restrict: 'A',
                    bindToController: true,
                    require: ['formGroup', '^^?formGroup'],
                    controller: function () {
                        this.$onInit = function () {
                            if (!(this.formGroup instanceof FormGroup)) {
                                ModelErrors.missingFormException();
                            }
                        }
                    }
                }
            }
        ]
    )
    .directive(
        'formGroupName', [
            
            function () {
                return {
                    scope: {
                        formGroupName: '@',
                    },
                    restrict: 'A',
                    require: ['?formGroupName', '^^?formArrayName', '^^?formGroupName', '^?formGroup'],
                    controller: [function () {
                    }],
                    link: {
                        pre: function (scope, element, attrs, ctrls) {
                            var conrolName = scope.formGroupName;
                            var parentCtrl = ctrls[1] || ctrls[2] || ctrls[3];

                            if (!parentCtrl) {
                                ModelErrors.groupParentException();
                            }

                            ctrls[0].formGroup = parentCtrl.formGroup.controls[conrolName];
                            ctrls[0].formGroup.setParent(parentCtrl.formGroup);
                        }
                    }

                }
            }
        ]
    )
    .directive(
        'formArrayName', [
            
            function () {
                return {
                    scope: {
                        formArrayName: '@'
                    },
                    restrict: 'A',
                    require: ['?formArrayName', '^^?formGroupName', '^?formGroup'],
                    controller: [function () {
                    }],
                    link: {
                        pre: function (scope, element, attrs, ctrls) {
                            var conrolName = scope.formArrayName;
                            var parentCtrl = ctrls[1] || ctrls[2];

                            if (!parentCtrl) {
                                ModelErrors.arrayParentException();
                            }

                            ctrls[0].formGroup = parentCtrl.formGroup.controls[conrolName];
                            ctrls[0].formGroup.setParent(parentCtrl.formGroup);
                        }
                    }
                }
            }
        ]
    )
    .directive(
        'formControlName', [
            
            function () {

                return {
                    scope: {
                        formControlName: '@',
                    },
                    restrict: 'A',
                    require: ['formControlName', '^^?formGroupName', '^^formGroup'],
                    controller: [function () {
                        this.onChanges = function () { };

                        this._setElementStatusClass = function (status, element) {
                            switch (status) {
                                case 'VALID':
                                    element.addClass('md-valid').removeClass('md-invalid md-pending');
                                    break;
                                case 'INVALID':
                                    element.addClass('md-invalid').removeClass('md-valid md-pending');
                                    break;
                                case 'PENDING':
                                    element.addClass('md-pending').removeClass('md-invalid md-valid');
                                    break;
                                case 'DISABLED':
                                    element.addClass('md-disabled').removeClass('md-valid md-invalid md-pending');
                                    break;
                                default:
                                    break;
                            }
                        };

                        this._onChange = function (control) {
                            var self = this;
                            return function (event) {
                                control.setValue(self._getValue(event));
                            }
                        };

                        this._setValue = function (element, val) {
                            var value = val || '', isMulti;

                            switch (element.type) {
                                case 'radio':
                                    if (element.value === value) {
                                        element.checked = true;
                                    }
                                    break;
                                case 'checkbox':
                                    isMulti = Array.isArray(value);

                                    if (isMulti && value.length === 0) {
                                        return;
                                    }

                                    if (isMulti && value.indexOf(value) !== -1) {
                                        element.checked = true;
                                        return;
                                    }

                                    if (!isMulti && value) {
                                        element.checked = true;
                                        return;
                                    }
                                    break;
                                case 'select-multiple':
                                    if (Array.isArray(value) && value.length === 0) {
                                        return;
                                    }

                                    setTimeout(function () {
                                        var selected, option;

                                        for (var i = 0; i < element.length; i++) {
                                            option = element.options[i];
                                            selected = Array.prototype.indexOf.call(value, option.value) !== -1;
                                            option.selected = selected;
                                        }
                                    });
                                    break;
                                case 'file':
                                    if (value instanceof File) {
                                        element.value = value;
                                    }
                                    break;
                                default:
                                    element.value = value;
                            }
                        };

                        this._getValue = function (event) {
                            switch (event.target.type) {
                                case 'text':
                                case 'password':
                                case 'email':
                                case 'number':
                                case 'search':
                                case 'url':
                                case 'date':
                                case 'datetime-local':
                                case 'month':
                                case 'range':
                                case 'tel':
                                case 'time':
                                case 'week':
                                case 'color':
                                    return event.target.value;
                                case 'checkbox':
                                    return event.target.checked;
                                case 'radio':
                                    if (event.target.checked) {
                                        return event.target.value;
                                    }
                                case 'file':
                                    return event.target.files;
                                case 'select-one':
                                    return event.target.options[event.target.selectedIndex].value;
                                case 'select-multiple':
                                    return Array.prototype.filter.call(
                                        event.target.options,
                                        function(o) {
                                            return o.selected;
                                        })
                                        .map(function(o) {
                                            return o.value;
                                        });
                                default:
                                    return event.target.value || '';
                            }
                        };
                    }],
                    link: {
                        pre: function (scope, element, attrs, ctrls) {
                            var controlName = scope.formControlName;
                            var parentCtrl = ctrls[1] || ctrls[2];

                            if (!parentCtrl && !parentCtrl.formGroup) {
                                ModelErrors.controlParentException();
                            }
                            if (!parentCtrl.formGroup.controls[controlName]) {
                                throw new Error("Cannot find control with name: '" + controlName + "'");
                            }

                            this.control = parentCtrl.formGroup.controls[controlName];
                            this.control.setParent(parentCtrl.formGroup);

                            if (element.prop('disabled')) {
                                this.control.disable();
                            }
                        },
                        post: function (scope, element, attrs, ctrls) {
                            var self = this;
                            var control = this.control;
                            var onChanges = ctrls[0]._onChange(this.control);

                            this.control.statusChanges(function (status) {
                                ctrls[0]._setElementStatusClass(status, element);
                            });

                            ctrls[0]._setValue(element[0], control.value);

                            this.control.valueChanges(function (value) {
                                ctrls[0]._setValue(element[0], value);
                            });

                            element.on('change', onChanges);
                            element.on('$destroy', function() {
                                element.off('change', onChanges);
                            });
                        }
                    }
                };
            }
        ]
    )
    .factory('ngFormBuilderValidators', [function() {
        return Validators;
    }])
    .factory('ngFormBuilderService', [function() {

        return {
            group: group,
            array: array,
            control: control
        };

        function group (controls, validators) {
            validators = validators || [];
            
            return new FormGroup(_reduceControls(controls), validators);
        }

        function array (controlConfig, validators) {
            validators = validators || [];
            var controls = controlConfig.map(function (c) { return _createControl(c); });

            return new FormArray(controls, validators);
        }

        function control (value, validators) {
            validators = validators || [];
            return new FormControl(value, validators);
        }

        function _reduceControls(controlConfig) {
            var controls = {};
            Object.keys(controlConfig).forEach(function (controlName) {
                controls[controlName] = _createControl(controlConfig[controlName]);
            });
            return controls;
        }

        function _createControl(controlConfig) {
            if (controlConfig instanceof FormControl || controlConfig instanceof FormGroup || controlConfig instanceof FormArray) {
                return controlConfig;
            }
            else if (Array.isArray(controlConfig)) {
              var value = controlConfig[0];
              var validator = controlConfig.length > 1 ? controlConfig[1] : null;
              var asyncValidator = controlConfig.length > 2 ? controlConfig[2] : null;
              
              return control(value, validator, asyncValidator);
            }
            else {
              return control(controlConfig);
            }
        }

    }])
    ;


    /**
     *
     *
     *
     *    Form Model
     *        - FormControl
     *        - FormGroup
     *        - FormArray
     *        - Validators
     *
     *
     */


    var VALID = 'VALID',
        INVALID = 'INVALID',
        PENDING = 'PENDING',
        DISABLED = 'DISABLED';

    var isEmpty = function(value) {
        return typeof value === 'undefined' || value === '' || value === null || value !== value;
    };

    function AbstractFormControl (validators, asyncValidators) {
      
      this.validators = validators ? Array.isArray(validators) ? validators : [validators] : [];
      this.asyncValidators = asyncValidators ? Array.isArray(asyncValidators) ? asyncValidators : [asyncValidators] : [];

      this.submitted = false;

      this.status = VALID;

      this.$errors = {};
      this.$parent = null;
      this.$onChanges = [];
      this.$onStatusChanges = [];
      this.$onDisabledChange = [];
     
      this.updateValueAndValidity();
    }

    AbstractFormControl.prototype.updateValueAndValidity = function (opts) {
      if (opts === void 0) { opts = {}; }
      
      this._setInitialStatus();
      this._updateValue();

      if (this.enabled) {
        this.$errors = this.$runValidator();
        this.status = this._calculateStatus();
        
        if (this.status === VALID || this.status === PENDING) {
          this.$runAsyncValidator(opts.emitEvent);
        }
      }
      if (opts.emitEvent !== false) {
        this.emitValueChanges(this.value);
        this.emitStatusChanges(this.status);
      }
      if (this.$parent && !opts.onlySelf) {
        this.$parent.updateValueAndValidity(opts);
      }
    };

    AbstractFormControl.prototype.setParent = function (parent) {
      if (!(parent instanceof FormGroup) && !(parent instanceof FormArray)) {
        throw new Error('First argument should be of either instance of FormGroup or FormArray, given ' + form.constructor);
      }

      this.$parent = parent;
    };

    AbstractFormControl.prototype.valueChanges = function (fn) {
      this.$onChanges.push(fn);
    };

    AbstractFormControl.prototype.emitValueChanges = function () {
      for (var i = 0; i < this.$onChanges.length; i++) {
        this.$onChanges[i](this.value);
      }
    };

    AbstractFormControl.prototype.emitStatusChanges = function () {
      for (var i = 0; i < this.$onStatusChanges.length; i++) {
        this.$onStatusChanges[i](this.status);
      }
    };

    AbstractFormControl.prototype.statusChanges = function (fn) {
      this.$onStatusChanges.push(fn);
    };

    AbstractFormControl.prototype.addValidator = function(validator) {
      if ((validator).toString() !== "[object Object]") {
          throw 'Validator should be object given ' + (typeof validator) + '!';
      }
      this.validators.push(validator);
    };

    AbstractFormControl.prototype.addValidators = function(validators) {
      if (!Array.isArray(validators)) {
          throw 'Validator should be an Array given ' + (typeof validators) + '!';
      }
      this.validators.concat(validators);
    };

    AbstractFormControl.prototype.addAsyncValidator = function(validator) {
      if ((validator).toString() !== "[object Object]") {
          throw 'Validator should be object given ' + (typeof validator) + '!';
      }
      this.asyncValidators.push(validator);
    };

    AbstractFormControl.prototype.addAsyncValidators = function(validators) {
      if (!Array.isArray(validators)) {
          throw 'Validator should be an Array given ' + (typeof validators) + '!';
      }
      this.asyncValidators.concat(validators);
    };

    AbstractFormControl.prototype.markAsTouched = function (opts) {
      if (opts === void 0) { opts = {}; }

      this.touched = true;
      
      if (this.$parent && !opts.onlySelf) {
        this.$parent.markAsTouched(opts);
      }
    };

    AbstractFormControl.prototype.markAsUntouched = function (opts) {
      if (opts === void 0) { opts = {}; }

      this.touched = false;
      this._pendingTouched = false;

      this._forEachChild(function (control) { control.markAsUntouched({ onlySelf: true }); });
      
      if (this.$parent && !opts.onlySelf) {
        this.$parent._updateTouched(opts);
      }
    };

    AbstractFormControl.prototype.markAsDirty = function (opts) {
      if (opts === void 0) { opts = {}; }

      this.pristine = false;
      
      if (this.$parent && !opts.onlySelf) {
        this.$parent.markAsDirty(opts);
      }
    };
      
    AbstractFormControl.prototype.markAsPristine = function (opts) {
      if (opts === void 0) { opts = {}; }
      this.pristine = true;
      this._pendingDirty = false;

      this._forEachChild(function (control) { control.markAsPristine({ onlySelf: true }); });
      
      if (this.$parent && !opts.onlySelf) {
        this.$parent._updatePristine(opts);
      }
    };

    AbstractFormControl.prototype.markAsPending = function (opts) {
      if (opts === void 0) { opts = {}; }
      this.status = PENDING;

      if (opts.emitEvent !== false) {
        this.emitStatusChanges(this.status);
      }
      if (this.$parent && !opts.onlySelf) {
        this.$parent.markAsPending(opts);
      }
    };

    AbstractFormControl.prototype.disable = function (opts) {
      if (opts === void 0) { opts = {}; }

      this.status = DISABLED;
      this.$errors = null;

      this._forEachChild(function (control) { control.disable(Object.assign({}, opts, { onlySelf: true })); });
      this._updateValue();
      
      if (opts.emitEvent !== false) {
        this.emitValueChanges(this.value);
        this.emitStatusChanges(this.status);
      }
      this._updateAncestors(opts);
      this.$onDisabledChange.forEach(function (changeFn) { return changeFn(true); });
    };

    AbstractFormControl.prototype._updateAncestors = function (opts) {
        if (this.$parent && !opts.onlySelf) {
            this.$parent.updateValueAndValidity(opts);
            this.$parent._updatePristine();
            this.$parent._updateTouched();
        }
    };

    AbstractFormControl.prototype.enable = function (opts) {
      if (opts === void 0) { opts = {}; }

      this.status = VALID;
      this._forEachChild(function (control) { control.enable(Object.assign({}, opts, { onlySelf: true })); });
      this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });
      this._updateAncestors(opts);
      this.$onDisabledChange.forEach(function (changeFn) { return changeFn(false); });
    };

    AbstractFormControl.prototype.setErrors = function (errors, opts) {
      if (opts === void 0) { opts = {}; }

      this.$errors = errors;
      this._updateControlsErrors(opts.emitEvent !== false);
    };

    Object.defineProperty(AbstractFormControl.prototype, "root", {
      get: function () {
          var x = this;
          while (x.$parent) {
              x = x.$parent;
          }
          return x;
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(AbstractFormControl.prototype, "valid", {
      get: function () { return this.status === VALID; },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(AbstractFormControl.prototype, "invalid", {
      get: function () { return this.status === INVALID; },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(AbstractFormControl.prototype, "pending", {
      get: function () { return this.status == PENDING; },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(AbstractFormControl.prototype, "disabled", {
      get: function () { return this.status === DISABLED; },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(AbstractFormControl.prototype, "enabled", {
      get: function () { return this.status !== DISABLED; },
      enumerable: true,
      configurable: true
    });

    AbstractFormControl.prototype._updateControlsErrors = function (emitEvent) {
      this.status = this._calculateStatus();
      if (emitEvent) {
        this.emitStatusChanges(this.status);
      }
      if (this.$parent) {
        this.$parent._updateControlsErrors(emitEvent);
      }
    };

    AbstractFormControl.prototype._calculateStatus = function () {
      if (this._allControlsDisabled())
          return DISABLED;
      if (Object.keys(this.$errors || {}).length)
          return INVALID;
      if (this._anyControlsHaveStatus(PENDING))
          return PENDING;
      if (this._anyControlsHaveStatus(INVALID))
          return INVALID;
      return VALID;
    };

    AbstractFormControl.prototype._anyControlsHaveStatus = function (status) {
      return this._anyControls(function (control) { return control.status === status; });
    };

    AbstractFormControl.prototype._anyControlsDirty = function () {
      return this._anyControls(function (control) { return control.dirty; });
    };

    AbstractFormControl.prototype._anyControlsTouched = function () {
      return this._anyControls(function (control) { return control.touched; });
    };

    AbstractFormControl.prototype.contains = function (controlName) {
      return this.controls.hasOwnProperty(controlName) && this.controls[controlName].enabled;
    };

    AbstractFormControl.prototype._updatePristine = function (opts) {
      if (opts === void 0) { opts = {}; }

      this.pristine = !this._anyControlsDirty();
      if (this.$parent && !opts.onlySelf) {
          this.$parent._updatePristine(opts);
      }
    };

    AbstractFormControl.prototype._updateTouched = function (opts) {
      if (opts === void 0) { opts = {}; }

      this.touched = this._anyControlsTouched();
      if (this.$parent && !opts.onlySelf) {
          this.$parent._updateTouched(opts);
      }
    };

    AbstractFormControl.prototype.$runValidator = function() {
      var validationResult, errors = {};
      
      if (this.validators.length > 0) {
        this.validators.forEach(function(validator) {
          if (validationResult = validator(this)) {
            Object.assign(errors, validationResult);
          }
        }, this);
      }

      return errors;
    };

    AbstractFormControl.prototype.$runAsyncValidator = function (emitEvent) {
      var self = this;

      if (this.asyncValidators.length > 0) {
        this.status = PENDING;
        this.emitStatusChanges(this.status);
      
        Object.keys(this.asyncValidators)
          .map(function (name) { return self.asyncValidators[name](self); })
          .reduce(function(promiseChain, currentTask) {
            return promiseChain.then(function(chainResults) {
              return currentTask.then(function(currentResult) {
                if (currentResult) {
                  return chainResults.concat([currentResult]);
                }
                return chainResults;
              });
            });
          }, Promise.resolve([]))
          .then(function (errors) {
            self.setErrors(errors, { emitEvent: emitEvent });
            self._calculateStatus();
            
            if (emitEvent) {
              self.emitStatusChanges();
            }
          });
      }
    };

    AbstractFormControl.prototype.setValue = function (value, options) {
      if (options === void 0) { options = {}; }

      this.value = this._pendingValue = value;

      if (this.$onChanges.length) {
        this.emitValueChanges(this.value);
      }

      this.updateValueAndValidity(options);
    };

    AbstractFormControl.prototype._setInitialStatus = function () {
      this.status = this._allControlsDisabled() ? DISABLED : VALID;
    };
    AbstractFormControl.prototype._allControlsDisabled = function () { };
    AbstractFormControl.prototype._forEachChild = function (cb) { };
    AbstractFormControl.prototype._updateValue = function () { };
    AbstractFormControl.prototype._anyControls = function (condition) { };


    function FormControl (state, validators, asyncValidators) {
      this.value = state;

      AbstractFormControl.call(this, validators, asyncValidators);
    }

    FormControl.prototype = Object.create(AbstractFormControl.prototype);
    FormControl.prototype.constructor = FormControl;


    FormControl.prototype.setValue = function (value, options) {
      var self = this;
      if (options === void 0) { options = {}; }

      this.value = this._pendingValue = value;
      if (this.$onChanges) {
        this.$onChanges.forEach(function(changeFn) {
         return changeFn(self.value)
        });
      }
      this.updateValueAndValidity(options);
    };

    FormControl.prototype.reset = function (state, options) {
      if (options === void 0) { options = {}; }
      if (state === void 0) { state = null; }
      this.value = state;
      this.markAsPristine(options);
      this.markAsUntouched(options);
      this.setValue(this.value, options);
      this._pendingChange = false;
    };

    FormControl.prototype._setInitialStatus = function () {
      this.status = this._allControlsDisabled() ? DISABLED : VALID;
    };

    FormControl.prototype._allControlsDisabled = function () { return this.disabled; };
    FormControl.prototype._forEachChild = function (cb) { };
    FormControl.prototype._updateValue = function () { };
    FormControl.prototype._anyControls = function (condition) { return false; };






    function FormGroup (controls, validators, asyncValidators) {
      this.controls = controls;
      this.value = {};

      AbstractFormControl.call(this, validators, asyncValidators);
    }

    FormGroup.prototype = Object.create(AbstractFormControl.prototype);
    FormGroup.prototype.constructor = FormGroup;

    FormGroup.prototype.setValue = function (value, options) {
      var self = this;
      if (options === void 0) { options = {}; }

      Object.keys(value).forEach(function (name) {
        self.controls[name].setValue(value[name], { onlySelf: true, emitEvent: options.emitEvent });
      });
      this.updateValueAndValidity(options);
    }

    FormGroup.prototype.reset = function (value, options) {
      if (value === void 0) { value = {}; }
      if (options === void 0) { options = {}; }

      this._forEachChild(function (control, name) {
        return control.reset(value[name], { onlySelf: true, emitEvent: options.emitEvent });
      });

      this.updateValueAndValidity(options);
      this._updatePristine(options);
      this._updateTouched(options);
    };

    FormGroup.prototype._setInitialStatus = function () {
      this.status = this._allControlsDisabled() ? DISABLED : VALID;
    };

    FormGroup.prototype._allControlsDisabled = function () {
      for (var controlName in this.controls) {
        if (this.controls[controlName].enabled) {
          return false;
        }
      }
      return Object.keys(this.controls).length > 0 || this.disabled;
    };

    FormGroup.prototype._updateValue = function () {
      var self = this;
      this._forEachChild(function (control, name) {
        self.value[name] = control.value;
      });
    };

    FormGroup.prototype._anyControls = function (condition) {
      var self = this, res = false;
      this._forEachChild(function (control, name) {
          res = res || (self.contains(name) && condition(control));
      });
      return res;
    };

    FormGroup.prototype._forEachChild = function (cb) {
      var self = this;
      Object.keys(this.controls).forEach(function (k) { return cb(self.controls[k], k); });
    };







    function FormArray (controls, validators, asyncValidators) {
      this.controls = controls;
      this.value = [];

      AbstractFormControl.call(this, validators, asyncValidators);
    }

    FormArray.prototype = Object.create(AbstractFormControl.prototype);
    FormArray.prototype.constructor = FormArray;


    FormArray.prototype.setValue = function(value, options) {
      if (options === void 0) { options = {}; }

      value.forEach(function (newValue, index) {
          this.at(index).setValue(newValue, { onlySelf: true, emitEvent: options.emitEvent });
      });
      this.updateValueAndValidity(options);
    };

    FormArray.prototype._allControlsDisabled = function () {
      for (var index in this.controls) {
          if (this.controls[index].enabled)
              return false;
      }
      return this.controls.length > 0 || this.disabled;
    };

    FormArray.prototype._anyControls = function (condition) {
      return this.controls.some(function (control) { return control.enabled && condition(control); });
    };

    FormArray.prototype._forEachChild = function (cb) {
        this.controls.forEach(function (control, index) { cb(control, index); });
    };

    FormArray.prototype._updateValue = function () {
      this.value = this.controls
      .filter(function (control) { return control.enabled || this.disabled })
      .map(function (control) { return control.value; });
    };

    FormArray.prototype.removeAt = function (index) {
        this.controls.splice(index, 1);
        this.updateValueAndValidity();
    };

    FormArray.prototype.reset = function (value, options) {
      if (value === void 0) { value = []; }
      if (options === void 0) { options = {}; }

      this._forEachChild(function (control, index) {
        return control.reset(value[index], { onlySelf: true, emitEvent: options.emitEvent });
      });

      this.updateValueAndValidity(options);
      this._updatePristine(options);
      this._updateTouched(options);
    };

    function Validators () {
    }

    Validators.required = function (control) {
      return isEmpty(control.value) ? { 'required': true } : null;
    };

    Validators.min = function (min) {
      return function (control) {
          if (isEmpty(control.value) || isEmpty(min)) {
              return null;
          }
          var value = parseFloat(control.value);

          return !isNaN(value) && value < min ? { 'min': { 'min': min, 'actual': control.value } } : null;
      };
    };

    Validators.max = function (max) {
      return function (control) {
          if (isEmpty(control.value) || isEmpty(max)) {
              return null;
          }
          var value = parseFloat(control.value);

          return !isNaN(value) && value > max ? { 'max': { 'max': max, 'actual': control.value } } : null;
      };
    };

    Validators.email = function (control) {
      if (isEmpty(control.value)) {
          return null;
      }
      
      return control.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i) ? null : { 'email': true };
    };

    Validators.nullValidator = function (c) { return null; }

    Validators.pattern = function (pattern) {
      if (!pattern)
          return Validators.nullValidator;
      var regex;
      var regexStr;
      if (typeof pattern === 'string') {
          regexStr = '';
          if (pattern.charAt(0) !== '^')
              regexStr += '^';
          regexStr += pattern;
          if (pattern.charAt(pattern.length - 1) !== '$')
              regexStr += '$';
          regex = new RegExp(regexStr);
      }
      else {
          regexStr = pattern.toString();
          regex = pattern;
      }
      return function (control) {
          if (isEmpty(control.value)) {
              return null;
          }
          var value = control.value;
          return regex.test(value) ? null :
              { 'pattern': { 'requiredPattern': regexStr, 'actualValue': value } };
      };
    };

    Validators.minLength = function (minLength) {
      return function (control) {
          if (isEmpty(control.value)) {
              return null;
          }
          var length = control.value ? control.value.length : 0;
          return length < minLength ?
              { 'minlength': { 'requiredLength': minLength, 'actualLength': length } } :
              null;
      };
    };

    Validators.maxLength = function (maxLength) {
      return function (control) {
          if (isEmpty(control.value)) {
              return null;
          }
          var length = control.value ? control.value.length : 0;
          return length > maxLength ?
              { 'maxLength': { 'requiredLength': maxLength, 'actualLength': length } } :
              null;
      };
    };
})(window, document);