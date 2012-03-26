//     Backbone.CQRS.js
//     (c) 2012 Jan Mühlemann
//     Backbone.CQRS may be freely distributed under the MIT license.

(function(){

    // Initial Setup
    // -------------

    // Save a reference to the global object.
    var root = this;

    // Save the value of the `Backbone` variable. All extended modules will 
    // be appended to Backbone namespace
    var Backbone = root.Backbone;
    Backbone.Do = {};

    // Shortcut to underscore
    var _ = root._;

    // For Backbone's purposes, jQuery or Zepto owns the `$` variable.
    var $ = root.jQuery || root.Zepto;
    var noop = $.noop;


    // Message Objects
    // ---------------

    Backbone.Do.Message = Backbone.Model.extend({      
        url: noop,
        fetch: noop,
        save: noop,
        destroy: noop
    });

    // Response = Done
    var Res = Backbone.Do.Message.extend({});

    // Request = Do
    Backbone.Do.Req = Backbone.CQRS.Message.extend({
        emit: function() {
            Backbone.Do.hub.emit(Backbone.Do.hub.reqChannel, this.parse(this.toJSON()));
        },

        parse: function(data) {
            return data;
        },

        observe: function(callback) {
            Backbone.Do.responseHandler.observe(this.id, callback);
        }
    });


    // Event Handling
    // --------------

    // Hub will listen to responses
    var hub = Backbone.CQRS.hub = {

        reqChannel: 'do',
        
        defaults: {
            reqChannel: 'do',
            resChannel: 'done',
            responseId: 'reqId'
        },

        init: function(options) {
            var self = this;

            if (!this.initialized) {
                this.initialized = true;
            
                options = _.extend(this.defaults, options);
                if (options.getRequestId) this.getRequestId = options.getRequestId;
                if (options.parseResponse) this.parseResponse = options.parseResponse;

                this.reqChannel = options.reqChannel;

                // forward incoming events to eventHandler by emitting it to 
                // dispatchEvent -> eventHandler is bound to this 'channel'
                this.on(options.resChannel, function(msg) {              
                    
                    // create an res object and set parsed message attributes
                    var res = new Response();
                    res.set(this.parseResponse(msg));

                    var attrs = res.toJSON();
                    res.reqId = self.getRequestId(attrs, options.responseId);
                    
                    // emit it -> forward to eventHandler
                    this.emit('resolveResponse', res);
                });
            }

        },

        parseResponse: function(msg) {
            var evt = msg;
            if (typeof evt == 'string') {
                evt = JSON.parse(evt);
            }
            return evt;
        },

        getRequestId: function(data, field) {
            return dive(data, field);
        }

    };
    _.extend(hub, Backbone.Events);

    // we use Backbone.Event but provide EventEmitters interface
    hub.on = hub.bind;
    hub.emit = hub.trigger;

    // Global Handler
    // -------------------

    Backbone.Do.ResponseHandler = function() {
        this.initialize.apply(this, arguments);
    };

    _.extend(Backbone.Do.ResponseHandler.prototype, Backbone.Events, {
        
        initialize: function() {
            this.observedRequests = [];
            
            // subscribe on incoming events
            Backbone.Do.hub.on('resolveResponse', function(res) {
                this.handle(res);
            }, this);

        },

        // handles incoming events from hub
        handle: function(res) {
            // to observing commands
            var pending = this.getPendingResponse(res);
            if (pending) {
                pending.callback(res);
                this.removePendingResponse(res);
            }
        },

        // add command to observe
        // in the handle function an event matching the command will 
        // call the provided callback
        observe: function(reqId, callback) {
            this.observedRequests.push({id: reqId, callback: callback});
        },

        getPendingRequest: function(res) {
            return _.detect(this.observedRequests, function(pend) {
                return pend.id == res.reqId;
            });
        },
        
        removePendingCommand: function(pending) {
            var index = _.indexOf(this.observedRequests, pending);       
            this.observedRequests.splice(index, 1);
        }

    });

    // create one instace of this global handler
    Backbone.Do.responseHandler = new ResponseHandler();

    // Functions
    // ---------

    var dive = function(obj, key) {
        var keys = key.split('.');
        var x = 0;
        var value = obj;
        while (keys[x]) {
            value = value && value[keys[x]];
            x++;
        }
        return value;
    };


}).call(this);